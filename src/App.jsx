import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./lib/auth";

// Públicas
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import LoginEmpresa from "./pages/auth/LoginEmpresa";
import SignUp from "./pages/auth/SignUp";
import Pago from "./pages/auth/Pago";
import Entorno from "./pages/entorno/Entorno";
import DistribuidorLogin from "./pages/distribuidor/Login";
import DistribuidorRegistro from "./pages/distribuidor/Registro";
import DistribuidorRegistroPago from "./pages/distribuidor/RegistroPago";

// App (empresa)
import AppLayout from "./pages/app/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import TrabajosList from "./pages/app/trabajos/TrabajosList";
import TrabajoForm from "./pages/app/trabajos/TrabajoForm";
import Clientes from "./pages/app/Clientes";
import ClienteForm from "./pages/app/ClienteForm";
import Presupuestos from "./pages/app/Presupuestos";
import PresupuestoForm from "./pages/app/PresupuestoForm";
import Albaranes from "./pages/app/Albaranes";
import Facturas from "./pages/app/Facturas";
import InventarioDashboard from "./pages/app/inventario/InventarioDashboard";
import Productos from "./pages/app/inventario/Productos";
import ProductoForm from "./pages/app/inventario/ProductoForm";
import Categorias from "./pages/app/inventario/Categorias";
import Alertas from "./pages/app/inventario/Alertas";
import MovimientosInv from "./pages/app/inventario/Movimientos";
import Proveedores from "./pages/app/inventario/Proveedores";
import OfertasPBS from "./pages/app/inventario/OfertasPBS";
import Caja from "./pages/app/Caja";
import CajaMovimientoForm from "./pages/app/CajaMovimientoForm";
import AdminUsuarios from "./pages/app/admin/Usuarios";
import AdminRoles from "./pages/app/admin/Roles";
import AdminLicencias from "./pages/app/admin/Licencias";
import AdminConfiguracion from "./pages/app/admin/Configuracion";

// Distribuidor
import DistribuidorLayout from "./pages/distribuidor/DistribuidorLayout";
import DistribuidorDashboard from "./pages/distribuidor/Dashboard";
import DistribuidorLicencias from "./pages/distribuidor/Licencias";
import DistribuidorClientes from "./pages/distribuidor/Clientes";
import DistribuidorReferencias from "./pages/distribuidor/Referencias";
import DistribuidorRanking from "./pages/distribuidor/Ranking";
import DistribuidorAlertas from "./pages/distribuidor/Alertas";

function RequireApp({ children }) {
  const { isAuth, session } = useAuth();
  if (!isAuth || session.context !== "usuario") return <Navigate to="/auth/login" replace />;
  return children;
}
function RequireDistribuidor({ children }) {
  const { isAuth, session } = useAuth();
  if (!isAuth || session.context !== "distribuidor") return <Navigate to="/distribuidor/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/login-empresa" element={<LoginEmpresa />} />
      <Route path="/auth/sign-up" element={<SignUp />} />
      <Route path="/auth/pago" element={<Pago />} />
      <Route path="/entorno" element={<Entorno />} />
      <Route path="/distribuidor/login" element={<DistribuidorLogin />} />
      <Route path="/distribuidor/registro" element={<DistribuidorRegistro />} />
      <Route path="/distribuidor/registro/pago" element={<DistribuidorRegistroPago />} />

      {/* App empresa */}
      <Route
        element={
          <RequireApp>
            <AppLayout />
          </RequireApp>
        }
      >
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/trabajos" element={<TrabajosList vista="todos" />} />
        <Route path="/app/trabajos/sin-asignar" element={<TrabajosList vista="sin_asignar" />} />
        <Route path="/app/trabajos/pendientes" element={<TrabajosList vista="pendientes" />} />
        <Route path="/app/trabajos/presupuestar" element={<TrabajosList vista="pendiente_presupuesto" />} />
        <Route path="/app/trabajos/produccion" element={<TrabajosList vista="produccion" />} />
        <Route path="/app/trabajos/para-entregar" element={<TrabajosList vista="para_entregar" />} />
        <Route path="/app/trabajos/entregados" element={<TrabajosList vista="entregados" />} />
        <Route path="/app/trabajos/nuevo" element={<TrabajoForm />} />
        <Route path="/app/trabajos/:id/editar" element={<TrabajoForm />} />
        <Route path="/app/clientes" element={<Clientes />} />
        <Route path="/app/clientes/nuevo" element={<ClienteForm />} />
        <Route path="/app/clientes/:id/editar" element={<ClienteForm />} />
        <Route path="/app/presupuestos" element={<Presupuestos />} />
        <Route path="/app/presupuestos/nuevo" element={<PresupuestoForm />} />
        <Route path="/app/albaranes" element={<Albaranes />} />
        <Route path="/app/facturas" element={<Facturas />} />
        <Route path="/app/inventario" element={<InventarioDashboard />} />
        <Route path="/app/inventario/productos" element={<Productos />} />
        <Route path="/app/inventario/productos/nuevo" element={<ProductoForm />} />
        <Route path="/app/inventario/productos/:id/editar" element={<ProductoForm />} />
        <Route path="/app/inventario/categorias" element={<Categorias />} />
        <Route path="/app/inventario/alertas" element={<Alertas />} />
        <Route path="/app/inventario/movimientos" element={<MovimientosInv />} />
        <Route path="/app/inventario/proveedores" element={<Proveedores />} />
        <Route path="/app/inventario/ofertas-pbs" element={<OfertasPBS />} />
        <Route path="/app/caja" element={<Caja />} />
        <Route path="/app/caja/nuevo-movimiento" element={<CajaMovimientoForm />} />
        <Route path="/app/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/app/admin/roles" element={<AdminRoles />} />
        <Route path="/app/admin/licencias" element={<AdminLicencias />} />
        <Route path="/app/admin/configuracion" element={<AdminConfiguracion />} />
      </Route>

      {/* Portal distribuidor */}
      <Route
        element={
          <RequireDistribuidor>
            <DistribuidorLayout />
          </RequireDistribuidor>
        }
      >
        <Route path="/distribuidor/dashboard" element={<DistribuidorDashboard />} />
        <Route path="/distribuidor/referencias" element={<DistribuidorReferencias />} />
        <Route path="/distribuidor/clientes" element={<DistribuidorClientes />} />
        <Route path="/distribuidor/alertas" element={<DistribuidorAlertas />} />
        <Route path="/distribuidor/ranking" element={<DistribuidorRanking />} />
        <Route path="/distribuidor/licencias" element={<DistribuidorLicencias />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
