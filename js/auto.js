class Auto extends Vehiculo
{
    constructor(id, modelo, anoFabricacion, velMax, cantidadPuertas, asientos)
    {
        super(id, modelo, anoFabricacion, velMax);
        this.cantidadPuertas = cantidadPuertas;
        this.asientos = asientos;
    }

    toString()
    {
        return  `Auto: ` + super.toString() + `Cantidad de puertas: ${this.cantidadPuertas}` + `Asientos: ${this.$asientos}`;
    }

}