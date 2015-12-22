var Zone = function(x,y,size,rect) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.rect = rect;
    this.herbivores = 0.0;
    this.carnivores = 0.0;
    this.vegetation = 0.0;
    this.locked = false;
};

Zone.prototype.draw = function () {
    var xPos = this.x*this.size;
    var yPos = this.y*this.size;
    var popSum = this.vegetation+this.herbivores+this.carnivores;
    if(popSum == 0.0) {
        this.rect.graphics.beginFill("gray").drawRect(xPos,yPos,this.size,this.size);
        return;
    }
    /*
    this.rect.graphics.beginFill("rgba(0,200,200,"+this.herbivores/popSum+")").drawRect(xPos,yPos,this.size,this.size);
    
    this.rect.graphics.beginFill("rgba(200,0,0,"+this.carnivores/popSum+")").drawRect(xPos,yPos,this.size,this.size);
    
    this.rect.graphics.beginFill("rgba(0,150,0,"+this.trees/popSum+")").drawRect(xPos,yPos,this.size,this.size);
    
    this.rect.graphics.beginFill("rgba(0,200,0,"+this.vegetation/popSum+")").drawRect(xPos,yPos,this.size,this.size);
    */
    
    var splitSize = (this.herbivores/popSum)*this.size;
    var portion = this.herbivores/100.0;
    //this.rect.graphics.beginFill("rgba("+col+","+col+",0,1.0)").drawRect(xPos,yPos,splitSize,this.size);
    this.rect.graphics.beginFill("rgba(200,200,0,"+portion+")").drawRect(xPos,yPos,splitSize,this.size);
    var offset = splitSize;
    splitSize = (this.carnivores/popSum)*this.size;
    portion = this.carnivores/100.0;
    this.rect.graphics.beginFill("rgba(200,0,0,"+portion+")").drawRect(xPos+offset,yPos,splitSize,this.size);
    //this.rect.graphics.beginFill("rgba(255,0,0,1.0)").drawRect(xPos+offset,yPos,splitSize,this.size);
    offset += splitSize;
    splitSize = (this.vegetation/popSum)*this.size;
    portion = this.vegetation/100.0;
    
    //this.rect.graphics.beginFill("rgba(0,"+col+",0,1.0)").drawRect(xPos+offset,yPos,splitSize,this.size);
    this.rect.graphics.beginFill("rgba(0,200,0,"+portion+")").drawRect(xPos+offset,yPos,splitSize,this.size);
    //throw new Error("STOP");
};

function getRandomDirection () {
    var r = Math.random();
    if(r < 0.25){
        return {x: 1, y: 0};
    } else if(r > 0.25 && r < 0.5) {
        return {x: -1, y: 0};
    } else if(r > 0.5 && r < 0.75) {
        return {x: 0, y: 1};
    } else {
        return {x: 0, y: -1};
    }
}
/*
Zone.prototype.spread = function (grid) {
    //var offset = getRandomDirection();
    //var target = grid[this.x+offset.xOffset][this.y+offset.yOffset];
    if(this.vegetation != null && target.vegetation == null) {
        target.vegetation = new Vegetation(this.vegetation.height, 1);
        target.types++;
    }
    if(this.trees != null && target.trees == null) {
        target.trees = new Tree(this.trees.type, 1);
        target.types++;
    }
    //(height, speed, type,population)
    // TODO: fix population migration
    if(this.herbivores != null && target.herbivores == null) {
        target.herbivores = new Herbivore(this.herbivores.height, this.herbivores.speed, this.herbivores.type, this.herbivores.population/5);
        this.herbivores.population -= this.herbivores.population/5;
        target.types++;
    }
    if(this.carnivores != null && target.carnivores == null) {
        target.carnivores = new Carnivore(this.carnivores.height, this.carnivores.speed, this.carnivores.type, this.carnivores.population/5);
        this.carnivores.population -= this.carnivores.population/5;
        target.types++;
    }
};
 */
Zone.prototype.spread = function (grid) {
    if(this.locked) return;
    // Only spread if population is half full or more
    // TODO: variable spread amounts (maybe upgrades?)
    // FIXME: should vegetation spread be prioritized this way?
    var herbivoreSpread = 0.15;
    var vegetationSpread = 0.01;
    
    if(this.vegetation > 50.0 && Math.random() > 0.5) {
        var dir = getRandomDirection();
        var target = grid[this.x+dir.x][this.y+dir.y];
        target.vegetation += vegetationSpread*this.vegetation;
        target.locked = true;
    }
    if(this.herbivores > 50.0 && Math.random() > 0.5) {
        var dir = getRandomDirection();
        var target = grid[this.x+dir.x][this.y+dir.y];
        target.herbivores += herbivoreSpread*this.herbivores;
        target.locked = true;
    }
    // carnivores just wander around to find they prey
    // TODO: split them up if they are >50
    var dir = getRandomDirection();
    var target = grid[this.x+dir.x][this.y+dir.y];
    target.carnivores += this.carnivores;
    target.locked = true;
    this.carnivores = 0;
};

Zone.prototype.resolve = function(grid) {
    // Remove low populations
    // Resolve "conflicts"
    // TODO: carnivores should stay, deplete and spread into neighbouring
    // TODO: all these should be proportional
    if(this.herbivores > 0.0) {
        this.herbivores += 0.05*this.herbivores+0.05*this.vegetation;
        this.vegetation *= 0.95;
    }
    if(this.carnivores > 0.0) {
        this.carnivores += 0.01*this.carnivores+0.1*this.herbivores;
        this.herbivores *= 0.9;
    }
    if(this.vegetation < 5.0) {
        this.herbivores *= 0.95;
    }
    if(this.herbivores < 5.0) {
        this.carnivores *= 0.95;
    }
    
    this.herbivores = Math.min(this.herbivores, 100.0);
    this.vegetation = Math.min(this.vegetation, 100.0);
    this.carnivores = Math.min(this.carnivores, 100.0);
};

Zone.prototype.update = function (grid) {
    this.spread(grid);
    this.resolve(grid);
};