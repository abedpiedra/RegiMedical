import { Counter } from "../models/counter.model.js";

export async function getNextSequence(name) {
  // Busca un documento en la colección "Counter" con _id igual a "name".
  // Si existe, incrementa en 1 el campo "seq".
  // Si no existe, crea uno nuevo con _id=name y seq=1 (por upsert:true).
  // La opción new:true hace que retorne el documento *actualizado* (después del incremento).
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // Retorna el valor actualizado del contador.
  return counter.seq;
}
