import {
  ActividadEnajenacionTotal,
  ActividadFinancieraTotal,
  ActividadIndustrialTotal,
  OtrosIngresosTotal,
  ServiciosProfesionalesTotal,
} from './actividad.model';
import { Monto } from './common.model';

export interface Ingresos {
  remuneracionMensualCargoPublico: Monto; //
  otrosIngresosMensualesTotal: Monto;
  actividadIndustrialComercialEmpresarial: ActividadIndustrialTotal;
  actividadFinanciera: ActividadFinancieraTotal;
  actividadEnajenacion: ActividadEnajenacionTotal;
  serviciosProfesionales: ServiciosProfesionalesTotal;
  otrosIngresos: OtrosIngresosTotal;
  ingresoMensualNetoDeclarante: Monto;
  ingresoMensualNetoParejaDependiente: Monto;
  totalIngresosMensualesNetos: Monto;
  aclaracionesObservaciones: string;
}
