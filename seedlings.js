var Vegetation = function (height,population) {
    this.height = height;
    this.population = population;
};

/*
    Animal types:
        0: green
        1: fruit
*/
var Tree = function (type,population) {
    this.type = type;
    this.population = population;
};

/*
    Animal types:
        0: ground animal
        1: tree animal
        2: flying animal (only carnivore)
        3: ground+tree
*/

var Herbivore = function (height, speed, type,population) {
    this.height = height;
    this.speed = speed;
    if(type == 2) throw "Invalid herbivore type";
    this.type = type;
    this.population = population;
};

var Carnivore = function(height, speed, type,population) {
    this.height = height;
    this.speed = speed;
    this.type = type;
    this.population = population;
};

