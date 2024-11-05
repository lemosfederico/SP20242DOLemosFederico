class Camion extends Vehiculo
{
    constructor(id, modelo, anoFabricacion, velMax, carga, autonomia)
    {
        super(id, modelo, anoFabricacion, velMax);
        this.carga = carga;
        this.autonomia = autonomia;
    }

    toString() 
    {
        return `Camion: ` + super.toString() + `Carga: ${this.carga}` + `Autonomia: ${this.autonomia}`;
    }

}