// INTEGRANTE: Jonathan Quingahuano
// PARTE 1: LAS IMPORTACIONES (TRAER HERRAMIENTAS)
// Traigo lo de express pra manejar peticiones y respuestas, y Zod pra los errores.
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
// PARTE 2: LA FUNCION FILTRO (VALIDATETASK)
// Aqui creo la funcion que va a recibir el esquema de zod pra revisar la peticion.
export const validateTask = (schema: AnyZodObject) => {
    // Retorno una funcion asincrona porq maneja la respuesta del servidor.
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Intenta validar lo que viene en el cuerpo de la petición
            // Compara q el body cumpla con las reglas que pusimos en el Schema.
            schema.parse(req.body);
            // Si todo esta bien y no falta ningun dato obligatorio, next() deja pasar al controlador.
            next(); 
        } catch (error) {
            // PARTE 3: CONTROL DE ERRORES SI FALTA ALGO
            // Si falta el titulo o es muy corto, el catch atrapa el fallo de Zod.
            if (error instanceof ZodError) {
                // Freno todo con un estado 400 y devuelvo el json que nos dio el inge.
                res.status(400).json({
                    status: "error_validacion",
                    // Recorro los errores de zod pra sacar solo el campo fallado y el mensaje.
                    errors: error.errors.map(err => ({
                        campo: err.path[0],
                        mensaje: err.message
                    }))
                });
                return; // Pongo el return pra que la funcion muera aqui y no haga nada mas.
            }
            // Si es un error raro q no es de zod, se lo mando al sig middleware con next.
            next(error); 
        }
    };
};