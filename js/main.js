const apiUrl = "https://examenesutn.vercel.app/api/VehiculoAutoCamion";

let listaVehiculos = [];

document.addEventListener("DOMContentLoaded", function () 
{
    mostrarlistaVehiculos();
    document.getElementById("btnAgregar").addEventListener("click", () => 
    {
        agregarVehiculo();
        mostrarCabecera("Alta");
    });

    document.getElementById("btnCancelar").addEventListener("click", () => 
    {
        ocultarAbmForm();
    });

    document.getElementById("btnAceptar").addEventListener("click", () => 
    {
        aceptar();
    });

    document.getElementById("selectTipo").addEventListener("change", function() 
    {
        actualizarVisibilidadDeCampo(this.value);
    });
});

function mostrarlistaVehiculos() 
{
    mostrarSpinner();
    const xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl, true);
    xhr.onreadystatechange = function () 
    {
        if(xhr.readyState == 4 && xhr.status == 200) 
        {   
            listaVehiculos = JSON.parse(xhr.responseText);
            renderizarTabla();
            ocultarSpinner(); 
        }
    };
    xhr.send();
}

function renderizarTabla() 
{
    const tbody = document.getElementById("tablaVehiculos").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";
    listaVehiculos.forEach(vehiculo => 
    {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${vehiculo.id}</td>
            <td>${vehiculo.modelo}</td>
            <td>${vehiculo.anoFabricacion}</td>
            <td>${vehiculo.velMax}</td>
            <td>${vehiculo.cantidadPuertas || "N/A"}</td>
            <td>${vehiculo.asientos || "N/A"}</td>
            <td>${vehiculo.carga || "N/A"}</td>
            <td>${vehiculo.autonomia || "N/A"}</td>
            <td><button class="btnModify" onclick="editarVehiculo(${vehiculo.id})">Modificar</button></td>         
            <td><button class="btnDelete" onclick="mostrarFormBorrar(${vehiculo.id})">Eliminar</button></td>
            `;
        tbody.appendChild(tr);
    });
}

function agregarVehiculo() 
{
    limpiarAbmForm();
    Array.from(document.querySelectorAll("#formularioAbm input, #formularioAbm select")).forEach(element => 
    {
        element.readOnly = false;
        element.disabled = false;
    });
    document.getElementById("abmId").setAttribute("readonly", true);
    document.getElementById("abmId").setAttribute("disabled", true);
    document.getElementById("formularioAbm").style.display = "block";
    document.getElementById("formularioLista").style.display = "none";

    document.getElementById("btnAceptar").style.display = "inline";
    document.getElementById("btnAceptarBaja").style.display = "none";
}

function aceptar() 
{
    const nuevoVehiculo = obtenerFormDatos();
    if(nuevoVehiculo) 
    {
        if(!validarCampos(nuevoVehiculo)) 
        {
            return;
        }
        if(nuevoVehiculo.id) 
        {
            actualizarVehiculo(nuevoVehiculo);
        }
        else
        {
            guardarVehiculo(nuevoVehiculo);
        }
    }
}


async function guardarVehiculo(vehiculo) 
{
    mostrarSpinner();
    try
    {
        const respuesta = await fetch(apiUrl,
        {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify(vehiculo)
        });

        if(respuesta.ok) 
        {
            const data = await respuesta.json();
            vehiculo.id = data.id;
            listaVehiculos.push(vehiculo);
            renderizarTabla();
            ocultarAbmForm();
        }
        else
        {
            const mensajeError = await respuesta.text();
            throw new Error(`Error al guardar el vehiculo: ${respuesta.status} ${mensajeError}`);
        }
    } 
    catch(error) 
    {
        console.error(error);
    }
    finally 
    {
        ocultarSpinner();
    }
}

function actualizarVehiculo(vehiculo) 
{
    mostrarSpinner();
    fetch(apiUrl, 
    {
        method: "PUT",
        headers: 
        {
            "Content-Type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify(vehiculo)
    })
    .then(respuesta => 
    {
        if(respuesta.ok) 
        {
            return respuesta.text();
        }
        else 
        {
            throw new Error(`Error al actualizar el vehiculo: ${respuesta.status}`);
        }
    })
    .then(data => 
    {
        console.log(data);
        const indice = listaVehiculos.findIndex(v => v.id.toString() == vehiculo.id.toString());
        if(indice !== -1) 
        {
            listaVehiculos[indice] = vehiculo;
        }
        renderizarTabla();
        ocultarAbmForm();
    })
    .catch(error => 
    {
        alert(error.message);
        ocultarAbmForm();
    })
    .finally(() => 
    {
        ocultarSpinner();
    });
}


function obtenerFormDatos() 
{
    const id = document.getElementById("abmId").value;
    const modelo = document.getElementById("abmModelo").value;
    const anoFabricacion = document.getElementById("abmAnoFabricacion").value;
    const velMax = document.getElementById("abmVelMax").value;
    const tipo = document.getElementById("selectTipo").value;
    let vehiculo;

    if(tipo === "Auto") 
    {
        const cantidadPuertas = document.getElementById("abmCantidadPuertas").value;
        const asientos = document.getElementById("abmAsientos").value;
        vehiculo = id ? new Auto(id, modelo, anoFabricacion, velMax, cantidadPuertas, asientos) : new Auto(null, modelo, anoFabricacion, velMax, cantidadPuertas, asientos);
    } 
    else 
    {
        const carga = document.getElementById("abmCarga").value;
        const autonomia = document.getElementById("abmAutonomia").value;
        vehiculo = id ? new Camion(id, modelo, anoFabricacion, velMax, carga, autonomia) : new Camion(null, modelo, anoFabricacion, velMax, carga, autonomia);
    }

    if(!vehiculo.id) 
    {
        delete vehiculo.id;
    }
    return vehiculo;
}

function mostrarSpinner() 
{
    document.getElementById("spinner").style.display = "block";
    document.getElementById("spinnerContainer").style.display = "flex";
}

function ocultarSpinner() 
{
    document.getElementById("spinner").style.display = "none";
    document.getElementById("spinnerContainer").style.display = "none";
}


function editarVehiculo(id) 
{
    mostrarCabecera("Modificacion");
    const vehiculo = listaVehiculos.find(v => v.id.toString() == id.toString());
    if(!vehiculo)
    {
        return;
    }

    document.getElementById("abmId").value = vehiculo.id;
    document.getElementById("abmModelo").value = vehiculo.modelo;
    document.getElementById("abmAnoFabricacion").value = vehiculo.anoFabricacion;
    document.getElementById("abmVelMax").value = vehiculo.velMax;

    document.getElementById("btnAceptar").style.display = "inline";
    document.getElementById("btnAceptarBaja").style.display = "none";

    Array.from(document.querySelectorAll("#formularioAbm input, #formularioAbm select")).forEach(element => 
    {
        element.readOnly = false;
        element.disabled = false;
    });

    document.getElementById("selectTipo").setAttribute("readonly",true)
    document.getElementById("selectTipo").setAttribute("disabled", true);
    document.getElementById("abmId").setAttribute("readonly",true);
    document.getElementById("abmId").setAttribute("disabled",true);
    
    if(vehiculo.cantidadPuertas !== undefined) 
    {
        document.getElementById("selectTipo").value = "Auto";
        document.getElementById("abmCantidadPuertas").value = vehiculo.cantidadPuertas;
        document.getElementById("abmAsientos").value = vehiculo.asientos;
        document.getElementById("Auto").style.display = "block";
        document.getElementById("Camion").style.display = "none";
    } 
    else 
    {
        document.getElementById("selectTipo").value = "Camion";
        document.getElementById("abmCarga").value = vehiculo.carga;
        document.getElementById("abmAutonomia").value = vehiculo.autonomia;
        document.getElementById("Auto").style.display = "none";
        document.getElementById("Camion").style.display = "block";
    }

    document.getElementById("formularioAbm").style.display = "block";
    document.getElementById("formularioLista").style.display = "none";
}

function mostrarCabecera(mode) 
{
    document.getElementById("encabezadoAbm").innerHTML = `${mode} de vehiculo`;
}

function ocultarAbmForm() 
{
    document.getElementById("formularioAbm").style.display = "none";
    document.getElementById("formularioLista").style.display = "block";
    document.getElementById("btnAceptar").style.display = "inline";
    document.getElementById("btnAceptarBaja").style.display = "none";
}

function limpiarAbmForm() 
{
    document.getElementById("abmId").value = "";
    document.getElementById("abmModelo").value = "";
    document.getElementById("abmAnoFabricacion").value = "";
    document.getElementById("abmVelMax").value = "";
    document.getElementById("abmCantidadPuertas").value = "";
    document.getElementById("abmAsientos").value = "";
    document.getElementById("abmCarga").value = "";
    document.getElementById("abmAutonomia").value = "";
}

function actualizarVisibilidadDeCampo(tipo) 
{
    if(tipo === "Auto") 
    {
        document.getElementById("Auto").style.display = "block";
        document.getElementById("Camion").style.display = "none";
    } 
    else if(tipo === "Camion")
    {
        document.getElementById("Auto").style.display = "none";
        document.getElementById("Camion").style.display = "block";
    }
}

function borrarVehiculo(id) 
{
    mostrarSpinner();
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", apiUrl);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () 
    {
        if(xhr.readyState == 4) 
        {
            if(xhr.status == 200) 
            {
                listaVehiculos = listaVehiculos.filter(v => v.id.toString() !== id.toString());
                renderizarTabla();
                alert("Vehiculo eliminado correctamente!");
            }
            else
            {
                alert("ERROR,no se pudo eliminar correctamente");
            }
        }
        ocultarSpinner();
        ocultarAbmForm();   
    };
    xhr.send(JSON.stringify({ id: id }));
}

function mostrarFormBorrar(id) 
{
    mostrarCabecera("Baja");
    const vehiculo = listaVehiculos.find(p => p.id.toString() == id.toString());
    if(!vehiculo)
    {
        return;
    }

    document.getElementById("abmId").value = vehiculo.id;
    document.getElementById("abmModelo").value = vehiculo.modelo;
    document.getElementById("abmAnoFabricacion").value = vehiculo.anoFabricacion;
    document.getElementById("abmVelMax").value = vehiculo.velMax;

    Array.from(document.querySelectorAll("#formularioAbm input, #formularioAbm select")).forEach(element => 
    {
        element.readOnly = true;
        element.disabled = true;
    });

    if(vehiculo.cantidadPuertas !== undefined) 
    {
        document.getElementById("selectTipo").value = "Auto";
        document.getElementById("abmCantidadPuertas").value = vehiculo.cantidadPuertas;
        document.getElementById("abmAsientos").value = vehiculo.asientos;
        document.getElementById("Auto").style.display = "block";
        document.getElementById("Camion").style.display = "none";
    } 
    else 
    {
        document.getElementById("selectTipo").value = "Camion";
        document.getElementById("abmCarga").value = vehiculo.carga;
        document.getElementById("abmAutonomia").value = vehiculo.autonomia;
        document.getElementById("Auto").style.display = "none";
        document.getElementById("Camion").style.display = "block";
    }

    document.getElementById("btnAceptar").style.display = "none";
    document.getElementById("btnAceptarBaja").style.display = "inline";

    document.getElementById("formularioAbm").style.display = "block";
    document.getElementById("formularioLista").style.display = "none";

    document.getElementById("btnAceptarBaja").onclick = function() 
    {
        borrarVehiculo(vehiculo.id);
    };
}

function validarCampos(vehiculo) 
{
    if(vehiculo.modelo !== undefined)
    {
        if(!vehiculo.modelo) 
        {   
            alert("Complete el campo modelo para continuar.");
            return false;
        }
    }

    if(vehiculo.anoFabricacion !== undefined)
    {
        if(!vehiculo.anoFabricacion || isNaN(vehiculo.anoFabricacion) || vehiculo.anoFabricacion <= 1985 || vehiculo.anoFabricacion > 2024) 
        {
            alert("Complete el campo año de fabricacion mayor a 1985 y menor al 2025 para continuar.");
            return false;
        }   
    }

    if(vehiculo.velMax !== undefined)
    {   
        if(!vehiculo.velMax || isNaN(vehiculo.velMax) || vehiculo.velMax < 1) 
        {
            alert("Complete el campo velocidad maxima mayor a 0 para continuar.");
            return false;
        }
    }

    if(vehiculo.cantidadPuertas !== undefined) 
    {
        if(!vehiculo.cantidadPuertas || isNaN(vehiculo.cantidadPuertas) || vehiculo.cantidadPuertas <= 2)  
        {   
            alert("Complete el campo cantidad de puertas mayor a 2 para continuar.");
            return false;   
        }
    }

    if(vehiculo.asientos !== undefined) 
    {
        if(!vehiculo.asientos || isNaN(vehiculo.asientos) || vehiculo.asientos <= 2)  
        {
            alert("Complete el campo cantidad de asientos mayor a 2 para continuar.");
            return false;   
        }
    }

    if(vehiculo.carga !== undefined) 
    {
        if(!vehiculo.carga || isNaN(vehiculo.carga) || vehiculo.carga < 1)  
        {
            alert("Ingrese cantidad de carga mayor a 0 para continuar.");
            return false;
        }
    }

    if(vehiculo.autonomia !== undefined) 
    {
        if(!vehiculo.autonomia || isNaN(vehiculo.autonomia) || vehiculo.autonomia < 1) 
        {
            alert("Complete el campo autonomia mayor a 0 para continuar.");
            return false;
        }
    }

    return true;
}