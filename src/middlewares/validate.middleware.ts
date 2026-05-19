//Jonathan Quingahuano
// PARTE 1: TRAER LAS HERRAMIENTAS (IMPORTACIONES)
// Traigo Express para manejar las peticiones, respuestas y los saltos de funciones.
import { Request, Response, NextFunction } from 'express';
// Traigo Zod pra poder usar los esquemas y capturar los errores si faltan datos.
import { AnyZodObject, ZodError } from 'zod';
// PARTE 2: CREAR EL FILTRO (LA FUNCION MIDDLEWARE)
// Creo la funcion que va a recibir nuestro esquema (como el taskSchema) pra revisar los datos.
export const validateSchema = (schema: AnyZodObject) => {
  // Retorno una funcion asincrona porq la validacion de Zod toma un momento en procesar.
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Con parseAsync reviso q lo que manda el usuario (body, query, params) cumpla las reglas.
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // PARTE 3: DEJAR PASAR O DETENER CON ERROR
      // Si todo esta correcto y completo, next() le da luz verde pra ir al controlador.
      next();
    } catch (error) {
      // Si falta el titulo, la descripcion o algo esta mal, el catch atrapa el error.
      if (error instanceof ZodError) {
        
        // Freno la peticion con un estado 400 (Bad Request) y devuelvo un JSON ordenado.
        res.status(400).json({
          status: 'error',
          // Recorro la lista de errores de Zod para sacar solo el campo fallido y su mensaje.
          errors: error.errors.map((issue) => ({
            campo: issue.path[1] || issue.path[0],
            mensaje: issue.message,
          })),
        });
        return; // Pongo el return pra que la funcion muera aqui y no siga ejecutando nada mas.
      }
      // Si pasa un error raro del servidor que no sea de Zod, se lo mando al sig middleware.
      next(error);
    }
  };
};