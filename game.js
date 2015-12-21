var Zone = function(x,y,size,rect) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.rect = rect;
    this.types = 0;
    this.herbivores = null;
    this.carnivores = null;
    this.trees = null;
    this.vegetation = null;
};

Zone.prototype.draw = function () {
    var xPos = this.x*this.size;
    var yPos = this.y*this.size;
    if(this.types == 0) {
        this.rect.graphics.beginFill("gray").drawRect(xPos,yPos,this.size,this.size);
        return;
    }
    var drawn = 0;
    var offset = 0.0;
    var splitSize = this.size/this.types;
    if(this.herbivores != null) {
        this.rect.graphics.beginFill("yellow").drawRect(xPos,yPos,splitSize,this.size);
        drawn++;
    }
    if(this.carnivores != null) {
        offset = drawn*splitSize;
        this.rect.graphics.beginFill("red").drawRect(xPos+offset,yPos,splitSize,this.size);
        drawn++;
    }
    if(this.trees != null) {
        offset = drawn*splitSize;
        this.rect.graphics.beginFill("darkgreen").drawRect(xPos+offset,yPos,splitSize,this.size);
        drawn++;
    }
    if(this.vegetation != null) {
        offset = drawn*splitSize;
        this.rect.graphics.beginFill("lightgreen").drawRect(xPos+offset,yPos,splitSize,this.size);
    }
    
};

function getRandomDirection () {
    var r = Math.random();
    if(r < 0.25){
        return {xOffset: 1, yOffset: 0};
    } else if(r > 0.25 && r < 0.5) {
        return {xOffset: -1, yOffset: 0};
    } else if(r > 0.5 && r < 0.75) {
        return {xOffset: 0, yOffset: 1};
    } else {
        return {xOffset: 0, yOffset: -1};
    }
}

Zone.prototype.spread = function (grid) {
    var offset = getRandomDirection();
    var target = grid[this.x+offset.xOffset][this.y+offset.yOffset];
    if(this.vegetation != null && target.vegetation == null) {
        target.vegetation = new Vegetation(this.vegetation.height, 1);
        target.types++;
    }
};

Zone.prototype.resolve = function(grid) {
    
};

Zone.prototype.update = function (grid) {
    this.spread(grid);
    this.resolve(grid);
};