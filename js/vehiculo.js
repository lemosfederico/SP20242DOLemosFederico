class Vehiculo
{
    constructor(id, modelo, anoFabricacion, velMax)
    {
        this.id = id;
        this.modelo = modelo;
        this.anoFabricacion = anoFabricacion;
        this.velMax = velMax;
    }

    toString()
    {
        return `id: ${this.id}, modelo: ${this.modelo}, año de fabricacion: ${this.anoFabricacion}, velMax: ${this.velMax},`;
    }

}

