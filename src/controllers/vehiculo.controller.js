const Vehiculo = require('../models/Vehiculo');
const Chofer = require('../models/Chofer'); // Needed to get chofer_id if not in req.user

// Helper function to get chofer_id if it's not directly in req.user
// This might need adjustment based on how your auth middleware sets up req.user
async function getChoferIdFromUserId(userId) {
  // Assuming you have a function in Chofer model to find by user_id
  // If not, this part needs to be created or adjusted.
  // For now, let's assume Chofer.getByUserId(userId) exists and returns { id: chofer_id, ... }
  const choferProfile = await Chofer.getByUserId(userId); // This function needs to be created in Chofer.js
  if (!choferProfile) {
    throw new Error('Chofer profile not found for this user.');
  }
  return choferProfile.id;
}

const showVehiculo = async (req, res) => {
  try {
    // Assuming req.user.id is the user_id from the users table
    // And we need to get the chofer_id (primary key from choferes table)
    // If your auth middleware already provides chofer_id in req.user (e.g., req.user.chofer_id), use that directly.
    // For this example, let's assume we need to fetch it.
    // console.log("req.user from showVehiculo:", req.user); // Log to see what's in req.user

    // IMPORTANT: Adjust this based on your actual auth middleware setup.
    // If req.user.role_id or req.user.profile_id is the chofer's ID in the 'choferes' table:
    const chofer_id = req.session.user && req.session.user.profile_id; // Or req.user.chofer_id, or req.user.specific_role_id

    if (!chofer_id) {
        // This case implies the authenticated user (chofer) does not have a profile_id (choferes table id)
        // This should ideally be caught by the role middleware or auth setup.
        console.error("Error: chofer_id not found in req.session.user.profile_id. User object:", req.session.user);
        return res.status(403).send("Acceso denegado o perfil de chofer no encontrado.");
    }

    const vehiculo = await Vehiculo.getVehiculoByChoferId(chofer_id);
    // The view should handle both cases: vehiculo exists or is null
    res.render('vehiculos/index', { vehiculo, error: null, success: null, choferId: chofer_id });
  } catch (error) {
    console.error("Error en showVehiculo:", error);
    // It's better to have a dedicated error page or pass error to the view
    res.status(500).render('vehiculos/index', { vehiculo: null, error: 'Error al obtener el vehículo.', success: null, choferId: (req.session.user && req.session.user.profile_id) || null });
  }
};

const storeVehiculo = async (req, res) => {
  // const chofer_id = req.user.chofer_id; // Adjust if necessary
  const chofer_id = req.session.user && req.session.user.profile_id;
  const { modelo, placa } = req.body;

  if (!chofer_id) {
    console.error("Error en storeVehiculo: chofer_id no disponible en req.session.user.profile_id. User:", req.session.user);
    return res.status(403).render('vehiculos/index', { vehiculo: null, error: 'No se pudo identificar al chofer.', success: null, choferId: null });
  }

  try {
    const existingVehiculo = await Vehiculo.getVehiculoByChoferId(chofer_id);
    if (existingVehiculo) {
      return res.render('vehiculos/index', {
        vehiculo: existingVehiculo,
        error: 'Ya tienes un vehículo asociado. Elimínalo antes de agregar uno nuevo.',
        success: null,
        choferId: chofer_id
      });
    }

    if (!modelo || !placa) {
      return res.render('vehiculos/index', {
        vehiculo: null,
        error: 'Modelo y placa son requeridos.',
        success: null,
        formData: { modelo, placa }, // Send back form data
        choferId: chofer_id
      });
    }

    const newVehiculo = await Vehiculo.createVehiculo(chofer_id, modelo, placa);
    res.render('vehiculos/index', { vehiculo: newVehiculo, error: null, success: 'Vehículo agregado exitosamente.', choferId: chofer_id });
  } catch (error) {
    console.error("Error en storeVehiculo:", error);
    res.status(500).render('vehiculos/index', { vehiculo: null, error: 'Error al agregar el vehículo.', success: null, formData: { modelo, placa }, choferId: chofer_id });
  }
};

const updateEstado = async (req, res) => {
  // const chofer_id = req.user.chofer_id; // Adjust if necessary
  const chofer_id = req.session.user && req.session.user.profile_id;
  const vehiculo_id = req.params.id;
  const { estado } = req.body;

  if (!chofer_id) {
    console.error("Error en updateEstado: chofer_id no disponible en req.session.user.profile_id. User:", req.session.user);
    // This should ideally not happen if auth is correctly set up
    return res.status(403).redirect('/vehiculos'); // Or show an error
  }

  try {
    const vehiculo = await Vehiculo.getVehiculoById(vehiculo_id);
    if (!vehiculo) {
      // Handle case where vehicle doesn't exist (e.g., show error, redirect)
      // For now, redirecting to the main vehicle page
      return res.redirect('/vehiculos?error=VehiculoNoEncontrado');
    }

    if (vehiculo.chofer_id !== chofer_id) {
      // Forbidden: driver trying to update a vehicle not belonging to them
      // This check is crucial for security.
      return res.status(403).redirect('/vehiculos?error=AccesoDenegado');
    }

    if (!['operativo', 'inoperativo'].includes(estado)) {
        // Invalid state value
        const currentVehiculo = await Vehiculo.getVehiculoByChoferId(chofer_id);
        return res.render('vehiculos/index', { vehiculo: currentVehiculo, error: 'Estado inválido.', success: null, choferId: chofer_id });
    }

    const updatedVehiculo = await Vehiculo.updateVehiculoEstado(vehiculo_id, estado);
    res.render('vehiculos/index', { vehiculo: updatedVehiculo, error: null, success: 'Estado del vehículo actualizado.', choferId: chofer_id });
  } catch (error) {
    console.error("Error en updateEstado:", error);
    const currentVehiculo = await Vehiculo.getVehiculoByChoferId(chofer_id).catch(() => null);
    res.status(500).render('vehiculos/index', { vehiculo: currentVehiculo, error: 'Error al actualizar el estado del vehículo.', success: null, choferId: chofer_id });
  }
};

const destroyVehiculo = async (req, res) => {
  // const chofer_id = req.user.chofer_id; // Adjust if necessary
  const chofer_id = req.session.user && req.session.user.profile_id;
  const vehiculo_id = req.params.id;

  if (!chofer_id) {
    console.error("Error en destroyVehiculo: chofer_id no disponible en req.session.user.profile_id. User:", req.session.user);
    return res.status(403).redirect('/vehiculos');
  }

  try {
    const vehiculo = await Vehiculo.getVehiculoById(vehiculo_id);
    if (!vehiculo) {
      return res.redirect('/vehiculos?error=VehiculoNoEncontrado');
    }

    if (vehiculo.chofer_id !== chofer_id) {
      return res.status(403).redirect('/vehiculos?error=AccesoDenegado');
    }

    await Vehiculo.deleteVehiculo(vehiculo_id);
    // After deleting, there's no vehicle, so pass null
    res.render('vehiculos/index', { vehiculo: null, error: null, success: 'Vehículo eliminado exitosamente.', choferId: chofer_id });
  } catch (error) {
    console.error("Error en destroyVehiculo:", error);
    const currentVehiculo = await Vehiculo.getVehiculoByChoferId(chofer_id).catch(() => null);
    res.status(500).render('vehiculos/index', { vehiculo: currentVehiculo, error: 'Error al eliminar el vehículo.', success: null, choferId: chofer_id });
  }
};

module.exports = {
  showVehiculo,
  storeVehiculo,
  updateEstado,
  destroyVehiculo,
};
