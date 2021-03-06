var Zone = function(x,y,size,rect) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.rect = rect;
    this.herbivores = 0.0;
    this.carnivores = 0.0;
    this.vegetation = 100.0;
    this.locked = false;
};

Zone.prototype.draw = function () {
    var xPos = this.x*this.size;
    var yPos = this.y*this.size;
    var popSum = this.vegetation+this.herbivores+this.carnivores;
    if(popSum < 5.0) {
        this.rect.graphics.beginFill("gray").drawRect(xPos,yPos,this.size,this.size);
        return;
    }
    
    var splitSize = (this.herbivores/popSum)*this.size;
    var portion = this.herbivores/100.0;
    //this.rect.graphics.beginFill("rgba("+col+","+col+",0,1.0)").drawRect(xPos,yPos,splitSize,this.size);
    //this.rect.graphics.beginFill("rgba(200,200,0,"+portion.toFixed()+")").drawRect(xPos,yPos,splitSize,this.size);
    this.rect.graphics.beginFill("yellow").drawRect(xPos,yPos,splitSize,this.size);
    var offset = splitSize;
    splitSize = (this.carnivores/popSum)*this.size;
    portion = this.carnivores/100.0;
    //this.rect.graphics.beginFill("rgba(200,0,0,"+portion.toFixed()+")").drawRect(xPos+offset,yPos,splitSize,this.size);
    this.rect.graphics.beginFill("red").drawRect(xPos+offset,yPos,splitSize,this.size);
    //this.rect.graphics.beginFill("rgba(255,0,0,1.0)").drawRect(xPos+offset,yPos,splitSize,this.size);
    offset += splitSize;
    splitSize = (this.vegetation/popSum)*this.size;
    portion = this.vegetation/100.0;
    
    //this.rect.graphics.beginFill("rgba(0,"+col+",0,1.0)").drawRect(xPos+offset,yPos,splitSize,this.size);
    //this.rect.graphics.beginFill("rgba(0,200,0,"+portion.toFixed()+")").drawRect(xPos+offset,yPos,splitSize,this.size);
    this.rect.graphics.beginFill("green").drawRect(xPos+offset,yPos,splitSize,this.size);
    //throw new Error("STOP");
};

function getRandomTarget (self) {
    var r = Math.random();
    var o = {};
    if(r < 0.25){
        o = {x: 1, y: 0};
    } else if(r > 0.25 && r < 0.5) {
        o = {x: -1, y: 0};
    } else if(r > 0.5 && r < 0.75) {
        o = {x: 0, y: 1};
    } else {
        o = {x: 0, y: -1};
    }
    return grid[self.x+o.x][self.y+o.y]
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
    // FIXME: should it really be vegetation>herbi>carni
    
    var vSpread         = 0.01,
        vSpreadChance   = 0.5,
        hSpread         = 0.15,
        hSpreadChance   = 0.5,
        cSpread         = 1.00;
    
    
    
    if(Math.random() > vSpreadChance) {
        var target = getRandomTarget(this);
        if(target.vegetation < this.vegetation) {
            target.vegetation += vegetationSpread*this.vegetation;
            target.locked = true;
        }
    }
    
    if(Math.random() > hSpreadChance) {
        var target = getRandomTarget(this);
        if(target.herbivores < this.herbivores) {
            target.herbivores += herbivoreSpread*this.herbivores;
            // Remove herbivores since they actually move
            this.herbivores -= herbivoreSpread*this.herbivores;
            target.locked = true;
        }
    }
    // carnivores just wander around to find they prey
    // TODO: split them up if they are >50
    if(this.carnivores > 50.0) {
        var dir = getRandomDirection();
        var target = grid[this.x+dir.x][this.y+dir.y];
        target.carnivores += this.carnivores/2;
        this.carnvores /= 2;
        target.locked = true;
    } else if(this.herbivores < 5.0) {
        var dir = getRandomDirection();
        var target = grid[this.x+dir.x][this.y+dir.y];
        target.carnivores += this.carnivores;
        target.locked = true;
        this.carnivores = 0;
    }
};

Zone.prototype.resolve = function(grid) {
    // Remove low populations
    // Resolve "conflicts"
    // TODO: carnivores should stay, deplete and spread into neighbouring
    // TODO: all these should be proportional
    // Rules:   vegetation grow slow and spread slow
    //
    
    // Vegetation grows on its own+proportionally
    var vSelfGrowth = 0.01,
        vGrow       = 0.01,
        hGrow       = 0.05,
        hFeed       = 0.05,
        hDemand     = 0.20,
        cGrow       = 0.01,
        cFeed       = 0.05,
        cDemand     = 0.20;
    this.vegetation += vSelfGrowth+vGrow*this.vegetation;
    this.vegetation -= hFeed*this.herbivores;
    
    this.vegetation = Math.min(Math.max(this.vegetation, 0.0), 100.0);

    this.herbivores += hGrow*this.herbivores-Math.max(hDemand*(this.herbivores-this.vegetation), 0.0);
    //alert("herb1: "+this.herbivores)
    this.herbivores -= cFeed*this.carnivores;
    //alert("herb2: "+this.herbivores)
    
    this.herbivores = Math.min(Math.max(this.herbivores, 0.0), 100.0);
    
    this.carnivores += cGrow*this.carnivores+Math.max(cDemand*(this.carnivores-this.herbivores), 0.0);
    this.carnivores = Math.min(Math.max(this.carnivores, 0.0), 100.0);
};

Zone.prototype.update = function (grid) {
    this.spread(grid);
    this.resolve(grid);
};