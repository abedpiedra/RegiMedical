import Proveedor from "../models/proveedors.model.js";
import { createAccessToken } from "../libs/jwt.js";

// Crear y guardar un nuevo proveedor
export const proveedor = async (req, res) => {
  const { nombre_empresa, direccion, telefono, email } = req.body;

  try {
    // Verifica si el proveedor ya existe por nombre de empresa
    const proveedorFound = await Proveedor.findOne({ nombre_empresa });

    if (proveedorFound)
      return res.status(400).json(["El Proveedor ya está registrado"]);

    // Crea el nuevo proveedor
    const newProveedor = new Proveedor({
      nombre_empresa,
      direccion,
      telefono,
      email,
    });

    const proveedorSaved = await newProveedor.save();
    const token = await createAccessToken({ id: proveedorSaved._id });

    // Guarda el token en una cookie
    res.cookie("token", token);
    res.json(proveedorSaved);
  } catch (error) {
    console.error("Error al guardar proveedor:", error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los proveedores registrados
export const proveedors = async (req, res) => {
  try {
    const proveedors = await Proveedor.find();
    res.json(proveedors);
  } catch (error) {
    console.error("Error al buscar proveedores:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Obtener un proveedor por ID
export const obtenerProveedorPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const proveedor = await Proveedor.findById(id);

    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.json(proveedor);
  } catch (error) {
    console.error("Error al obtener el proveedor:", error);
    res.status(500).json({ message: "Error al obtener los datos del proveedor" });
  }
};

// Eliminar un proveedor por ID
export const deleteProveedors = async (req, res) => {
  const { _id } = req.params;

  try {
    const result = await Proveedor.deleteOne({ _id });

    if (!result.deletedCount) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.json({ message: "Proveedor eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Actualizar los datos de un proveedor
export const actualizarProveedor = async (req, res) => {
  const { id } = req.params;
  const { nombre_empresa, email } = req.body;

  try {
    const updatedProveedor = await Proveedor.findByIdAndUpdate(
      id,
      { nombre_empresa, email },
      { new: true }
    );

    if (!updatedProveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.json({
      message: "Proveedor actualizado correctamente",
      data: updatedProveedor,
    });
  } catch (error) {
    console.error("Error al actualizar el proveedor:", error);
    res.status(500).json({ message: "Error al actualizar el proveedor" });
  }
};
