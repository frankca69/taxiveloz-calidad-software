//Frank
const model = require("../models/Cliente")

const create = (req, res) => {
    res.render('clientes/create');
};

const store = async (req, res) => {
  const { nombre, apellido, dni, telefono, correo } = req.body;
  const { redirect_url } = req.query; // Obtener redirect_url de los query params

  // Basic trimming (optional, but good practice)
  const finalDni = dni ? String(dni).trim() : '';
  const finalTelefono = telefono ? String(telefono).trim() : '';

  // REMOVED DNI Validation block:
  // if (!finalDni || finalDni.length !== 8) { ... }

  // REMOVED Telefono Validation block:
  // if (finalTelefono && finalTelefono.length !== 9) { ... }

  try {
    // Note: DNI existence check might still be relevant depending on requirements
    // For now, keeping it as it's a data integrity check, not a format validation.
    const dniExiste = await model.existsDNI(finalDni);

    if (dniExiste) {
      return res.render("clientes/create", {
        error: "El DNI ya está registrado.", // This is a uniqueness constraint, not format.
        formData: req.body
      });
    }

    await model.store({ nombre, apellido, dni: finalDni, telefono: finalTelefono, correo });

    // Redirección condicional
    if (redirect_url) {
      // Por seguridad, podrías validar que redirect_url sea a una ruta permitida en tu aplicación.
      // Por ahora, simplemente redirigimos si existe.
      // Ejemplo de validación simple: if (redirect_url === '/reservas/create') { ... }
      return res.redirect(redirect_url);
    } else {
      return res.redirect("/clientes");
    }

  } catch (error) {
    console.error("Error al guardar cliente:", error);
    // Al renderizar error, también pasamos redirect_url para que el formulario lo mantenga si es necesario
    return res.status(500).render("clientes/create", {
        error: "Error al guardar cliente",
        formData: req.body,
        redirect_url: redirect_url // Para que el action del form lo pueda incluir de nuevo si hay error
    });
  }
};

 
const index = async (req, res) => {
    try {
        const clientes = await model.getAll();
        res.render("clientes/index", { clientes });
    } catch (error) {
        res.status(500).send("Error al cargar clientes");
    }
};

const show = async (req, res) => {
    const { id } = req.params;

    try {
        const cliente = await model.getById(id);
        if (!cliente) return res.status(404).send("Cliente no encontrado");
        res.render("clientes/show", { cliente });
    } catch (error) {
        res.status(500).send("Error al cargar cliente");
    }
};


const edit = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await model.getById(id);
    if (!cliente) {
      return res.status(404).send("Cliente no encontrado");
    }

    res.render("clientes/edit", { cliente });
  } catch (error) {
    console.error("Error al cargar cliente:", error);
    res.status(500).send("Error al cargar cliente");
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, dni, telefono, correo } = req.body;

  // Basic trimming
  const finalDni = dni ? String(dni).trim() : '';
  const finalTelefono = telefono ? String(telefono).trim() : '';

  // REMOVED DNI Validation block:
  // if (!finalDni || finalDni.length !== 8) { ... }

  // REMOVED Telefono Validation block:
  // if (finalTelefono && finalTelefono.length !== 9) { ... }

  try {
    await model.updateCliente(id, { nombre, apellido, dni: finalDni, telefono: finalTelefono, correo });
    res.redirect("/clientes");
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    const cliente = await model.getById(id);
    res.status(500).render("clientes/edit", { error: "Error al actualizar cliente", formData: req.body, cliente: cliente });
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;

  try {
    await model.softDelete(id); // 👈 ahora llama al softDelete
    res.redirect("/clientes");
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).send("Error al eliminar cliente");
  }
};

module.exports = {
 index,
 show,
 create,
 store,
 edit,
 update,
 destroy,
};