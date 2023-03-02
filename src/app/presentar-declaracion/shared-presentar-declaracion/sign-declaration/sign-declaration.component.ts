import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DeclaracionOutput } from '@models/declaracion';
import { datosGeneralesQuery } from '@api/declaracion';
import { datosEmpleoCargoComisionQuery } from '@api/declaracion';
import { participacionQuery } from '@api/declaracion';
import { participacionTomaDecisionesQuery } from '@api/declaracion';
import { apoyosQuery } from '@api/declaracion';
import { representacionesQuery } from '@api/declaracion';
import { clientesPrincipalesQuery } from '@api/declaracion';
import { beneficiosPrivadosQuery } from '@api/declaracion';
import { fideicomisosQuery } from '@api/declaracion';
import { Apollo } from 'apollo-angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

export interface DialogData {
  tipoDeclaracion: string | null;
}

@Component({
  selector: 'app-sign-declaration',
  templateUrl: './sign-declaration.component.html',
  styleUrls: ['./sign-declaration.component.scss'],
})
export class SignDeclarationComponent implements OnInit {
  password: string = '';
  declaracionSimplificada = false;
  tipoDeclaracion: string = null;
  declaracionId: string = null;
  anio_ejercicio: number = null;
  nombre:string = null;
  nivelOrdenGobierno:string = null;
  nombreEmpresaSociedadAsociacion:string = null;
  nombreInstitucion:string = null;
  nombrePrograma:string = null;
  nombreRazonSocial:string = null;
  tipoRelacion:string = null;
  formaRecepcion:string = null;
  tipoFideicomiso:string = null;
  ninguno:boolean=null;
  valido:boolean=true;
  faltantes:string = '';
  mensaje:string = 'Faltan datos por capturar: ';
  completa:boolean=null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
  private apollo: Apollo, 
  private snackBar: MatSnackBar, 
  private router: Router
  ) {
    const urlChunks = this.router.url.split('/');
    this.declaracionSimplificada = urlChunks[2] === 'simplificada';
    this.tipoDeclaracion = urlChunks[1] || null;    
    this.getUserInfo_fideicomisos();
    this.getUserInfo_beneficios();
    this.getUserInfo_clientes();
    this.getUserInfo_repesentacion();
    this.getUserInfo_apoyos();
    this.getUserInfo_toma();
    this.getUserInfo_participacion();
    this.getUserInfo_otro();
    this.getUserInfo();
  }

  ngOnInit(): void {}

  openSnackBar(message: string, action: string = null) {
    this.snackBar.open(message, action, {
      duration: 15000,
    });
  }

  async getUserInfo() {
    try {
      const { data, errors } = await this.apollo
        .query<DeclaracionOutput>({
          query: datosGeneralesQuery,
          variables: {
            tipoDeclaracion: this.tipoDeclaracion.toUpperCase(),
            declaracionCompleta: !this.declaracionSimplificada,
          },
        })
        .toPromise();

      if (errors) {
        throw errors;
      }

      this.declaracionId = data?.declaracion._id;
      this.anio_ejercicio = data?.declaracion.anioEjercicio;

      this.completa = !this.declaracionSimplificada;
      if(typeof data?.declaracion.datosGenerales != 'undefined'){
        if(data?.declaracion.datosGenerales != null){
          if(typeof data?.declaracion.datosGenerales.nombre != 'undefined'){
            this.nombre = data?.declaracion.datosGenerales.nombre;
            if(this.nombre=="" || this.nombre==null){
              this.valido=false;
              this.faltantes="1. Datos Generales";
              this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
            }
          }else{
            this.valido=false;
            this.faltantes="1. Datos Generales";
            this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
          }
        }else{
          this.valido=false;
          this.faltantes="1. Datos Generales";
          this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
        }
      }else{
        this.valido=false;
        this.faltantes="1. Datos Generales";
        this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
      }
    } catch (error) {
      console.log(error);
      this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }

  async getUserInfo_otro() {
    try {
      const { data, errors } = await this.apollo
        .query<DeclaracionOutput>({
          query: datosEmpleoCargoComisionQuery,
          variables: {
            tipoDeclaracion: this.tipoDeclaracion.toUpperCase(),
            declaracionCompleta: !this.declaracionSimplificada,            
          },
        })
        .toPromise();

      if (errors) {
        throw errors;
      }

      this.declaracionId = data?.declaracion._id;      

      this.completa = !this.declaracionSimplificada;
      if(typeof data?.declaracion.datosEmpleoCargoComision != 'undefined'){
        if(data?.declaracion.datosEmpleoCargoComision != null){
          if(typeof data?.declaracion.datosEmpleoCargoComision.nivelOrdenGobierno != 'undefined'){
            this.nivelOrdenGobierno = data?.declaracion.datosEmpleoCargoComision.nivelOrdenGobierno;
            if(this.nivelOrdenGobierno=="" || this.nivelOrdenGobierno==null){
              this.valido=false;
              this.faltantes="4. Datos del empleo, cargo o comisión";
              this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
            }
          }else{
            this.valido=false;
            this.faltantes="4. Datos del empleo, cargo o comisión";
            this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
          }
        }else{
          this.valido=false;
          this.faltantes="4. Datos del empleo, cargo o comisión";
          this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
        }
      }else{
        this.valido=false;
        this.faltantes="4. Datos del empleo, cargo o comisión";
        this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
      }
    } catch (error) {
      console.log(error);
      this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }

  async getUserInfo_participacion() {
    try {
      const { data } = await this.apollo
        .query<DeclaracionOutput>({
          query: participacionQuery,
          variables: {
            tipoDeclaracion: this.tipoDeclaracion.toUpperCase(),
          },
        })
        .toPromise();

      this.declaracionId = data.declaracion._id;

      this.completa = !this.declaracionSimplificada;
      if(this.completa){
        if(typeof data?.declaracion.participacion != 'undefined'){
          if(data?.declaracion.participacion != null){
            if(typeof data?.declaracion.participacion.ninguno == 'undefined'){
              if(typeof data?.declaracion.participacion.participacion != 'undefined'){
                if(data?.declaracion.participacion.participacion != null){
                  if(typeof data?.declaracion.participacion.participacion[0].nombreEmpresaSociedadAsociacion != 'undefined'){
                    this.nombreEmpresaSociedadAsociacion = data?.declaracion.participacion.participacion[0].nombreEmpresaSociedadAsociacion;
                    if(this.nombreEmpresaSociedadAsociacion=="" || this.nombreEmpresaSociedadAsociacion==null){
                      this.valido=false;
                      this.faltantes="II. Declaración de intereses - 1. Participación en empresas, sociedades o asociaciones";
                      this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                    }              
                  }else{
                    this.valido=false;
                    this.faltantes="II. Declaración de intereses - 1. Participación en empresas, sociedades o asociaciones";
                    this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                  }
                }else{
                  this.valido=false;
                  this.faltantes="II. Declaración de intereses - 1. Participación en empresas, sociedades o asociaciones";
                  this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                }
              }else{
                this.valido=false;
                this.faltantes="II. Declaración de intereses - 1. Participación en empresas, sociedades o asociaciones";
                this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
              }
            }
          }else{
            this.valido=false;
            this.faltantes="II. Declaración de intereses - 1. Participación en empresas, sociedades o asociaciones";
            this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
          }
        }else{
          this.valido=false;
          this.faltantes="II. Declaración de intereses - 1. Participación en empresas, sociedades o asociaciones";
          this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
        }
      }
    } catch (error) {
      console.log(error);
      this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }

  async getUserInfo_toma() {
    try {
      const { data } = await this.apollo
        .query<DeclaracionOutput>({
          query: participacionTomaDecisionesQuery,
          variables: {
            tipoDeclaracion: this.tipoDeclaracion.toUpperCase(),
          },
        })
        .toPromise();

      this.declaracionId = data.declaracion._id;

      this.completa = !this.declaracionSimplificada;
      if(this.completa){
        if(typeof data?.declaracion.participacionTomaDecisiones != 'undefined'){
          if(data?.declaracion.participacionTomaDecisiones != null){
            if(typeof data?.declaracion.participacionTomaDecisiones.ninguno == 'undefined'){
              if(typeof data?.declaracion.participacionTomaDecisiones.participacion != 'undefined'){
                if(data?.declaracion.participacionTomaDecisiones.participacion != null){
                  if(typeof data?.declaracion.participacionTomaDecisiones.participacion[0].nombreInstitucion != 'undefined'){
                    this.nombreInstitucion = data?.declaracion.participacionTomaDecisiones.participacion[0].nombreInstitucion;
                    if(this.nombreInstitucion=="" || this.nombreInstitucion==null){
                      this.valido=false;
                      this.faltantes="II. Declaración de intereses - 2. Participa en la toma de decisiones";
                      this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                    }              
                  }else{
                    this.valido=false;
                    this.faltantes="II. Declaración de intereses - 2. Participa en la toma de decisiones";
                    this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                  }
                }else{
                  this.valido=false;
                  this.faltantes="II. Declaración de intereses - 2. Participa en la toma de decisiones";
                  this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                }
              }else{
                this.valido=false;
                this.faltantes="II. Declaración de intereses - 2. Participa en la toma de decisiones";
                this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
              }            
            }
          }else{
            this.valido=false;
            this.faltantes="II. Declaración de intereses - 2. Participa en la toma de decisiones";
            this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
          }
        }else{
          this.valido=false;
          this.faltantes="II. Declaración de intereses - 2. Participa en la toma de decisiones";
          this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
        }
      }
    } catch (error) {
      console.log(error);
      this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }

  async getUserInfo_apoyos() {
    try {
      const { data } = await this.apollo
        .query<DeclaracionOutput>({
          query: apoyosQuery,
          variables: {
            tipoDeclaracion: this.tipoDeclaracion.toUpperCase(),
          },
        })
        .toPromise();
      this.declaracionId = data.declaracion._id;

      this.completa = !this.declaracionSimplificada;
      if(this.completa){        
        if(typeof data?.declaracion.apoyos != 'undefined'){
          if(data?.declaracion.apoyos != null){
            if(typeof data?.declaracion.apoyos.ninguno == 'undefined'){
              if(typeof data?.declaracion.apoyos.apoyo != 'undefined'){
                if(data?.declaracion.apoyos.apoyo != null){
                  if(typeof data?.declaracion.apoyos.apoyo[0].nombrePrograma != 'undefined'){
                    this.nombrePrograma = data?.declaracion.apoyos.apoyo[0].nombrePrograma;
                    if(this.nombrePrograma=="" || this.nombrePrograma==null){
                      this.valido=false;
                      this.faltantes="II. Declaración de intereses - 3. Apoyos o beneficios públicos";
                      this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                    }              
                  }else{
                    this.valido=false;
                    this.faltantes="II. Declaración de intereses - 3. Apoyos o beneficios públicos";
                    this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                  }
                }else{
                  this.valido=false;
                  this.faltantes="II. Declaración de intereses - 3. Apoyos o beneficios públicos";
                  this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                }
              }else{
                this.valido=false;
                this.faltantes="II. Declaración de intereses - 3. Apoyos o beneficios públicos";
                this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
              }            
            }
          }else{
            this.valido=false;
            this.faltantes="II. Declaración de intereses - 3. Apoyos o beneficios públicos";
            this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
          }
        }else{
          this.valido=false;
          this.faltantes="II. Declaración de intereses - 3. Apoyos o beneficios públicos";
          this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
        }
      }
    } catch (error) {
      console.log(error);
      this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }

  async getUserInfo_repesentacion() {
    try {
      const { data } = await this.apollo
        .query<DeclaracionOutput>({
          query: representacionesQuery,
          variables: {
            tipoDeclaracion: this.tipoDeclaracion.toUpperCase(),
          },
        })
        .toPromise();

      this.declaracionId = data.declaracion._id;

      this.completa = !this.declaracionSimplificada;
      if(this.completa){
        if(typeof data?.declaracion.representaciones != 'undefined'){
          if(data?.declaracion.representaciones != null){
            if(typeof data?.declaracion.representaciones.ninguno == 'undefined'){
              if(typeof data?.declaracion.representaciones.representacion != 'undefined'){
                if(data?.declaracion.representaciones.representacion != null){
                  if(typeof data?.declaracion.representaciones.representacion[0].nombreRazonSocial != 'undefined'){
                    this.nombreRazonSocial = data?.declaracion.representaciones.representacion[0].nombreRazonSocial;
                    if(this.nombreRazonSocial=="" || this.nombreRazonSocial==null){
                      this.valido=false;
                      this.faltantes="II. Declaración de intereses - 4. Representación";
                      this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                    }              
                  }else{
                    this.valido=false;
                    this.faltantes="II. Declaración de intereses - 4. Representación";
                    this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                  }
                }else{
                  this.valido=false;
                  this.faltantes="II. Declaración de intereses - 4. Representación";
                  this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                }
              }else{
                this.valido=false;
                this.faltantes="II. Declaración de intereses - 4. Representación";
                this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
              }
            }
          }else{
            this.valido=false;
            this.faltantes="II. Declaración de intereses - 4. Representación";
            this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
          }
        }else{
          this.valido=false;
          this.faltantes="II. Declaración de intereses - 4. Representación";
          this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
        }
      }
    } catch (error) {
      console.log(error);
      this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }

  async getUserInfo_clientes() {
    try {
      const { data, errors } = await this.apollo
        .query<DeclaracionOutput>({
          query: clientesPrincipalesQuery,
          variables: {
            tipoDeclaracion: this.tipoDeclaracion.toUpperCase(),
          },
        })
        .toPromise();

      if (errors) {
        throw errors;
      }

      this.declaracionId = data?.declaracion._id;

      this.completa = !this.declaracionSimplificada;
      if(this.completa){
        if(typeof data?.declaracion.clientesPrincipales != 'undefined'){
          if(data?.declaracion.clientesPrincipales != null){
            if(typeof data?.declaracion.clientesPrincipales.ninguno == 'undefined'){
              if(typeof data?.declaracion.clientesPrincipales.cliente != 'undefined'){
                if(data?.declaracion.clientesPrincipales.cliente != null){
                  if(typeof data?.declaracion.clientesPrincipales.cliente[0].tipoRelacion != 'undefined'){
                    this.tipoRelacion = data?.declaracion.clientesPrincipales.cliente[0].tipoRelacion;
                    if(this.tipoRelacion=="" || this.tipoRelacion==null){
                      this.valido=false;
                      this.faltantes="II. Declaración de intereses - 5. Clientes principales";
                      this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                    }              
                  }else{
                    this.valido=false;
                    this.faltantes="II. Declaración de intereses - 5. Clientes principales";
                    this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                  }
                }else{
                  this.valido=false;
                  this.faltantes="II. Declaración de intereses - 5. Clientes principales";
                  this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                }
              }else{
                this.valido=false;
                this.faltantes="II. Declaración de intereses - 5. Clientes principales";
                this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
              }
            }
          }else{
            this.valido=false;
            this.faltantes="II. Declaración de intereses - 5. Clientes principales";
            this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
          }          
        }else{
          this.valido=false;
          this.faltantes="II. Declaración de intereses - 5. Clientes principales";
          this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
        }
      }
    } catch (error) {
      console.log(error);
      this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }

  async getUserInfo_beneficios() {
    try {
      const { data, errors } = await this.apollo
        .query<DeclaracionOutput>({
          query: beneficiosPrivadosQuery,
          variables: {
            tipoDeclaracion: this.tipoDeclaracion.toUpperCase(),
          },
        })
        .toPromise();

      if (errors) {
        throw errors;
      }

      this.declaracionId = data?.declaracion._id;

      this.completa = !this.declaracionSimplificada;
      if(this.completa){
        if(typeof data?.declaracion.beneficiosPrivados != 'undefined'){
          if(data?.declaracion.beneficiosPrivados != null){
            if(typeof data?.declaracion.beneficiosPrivados.ninguno == 'undefined'){
              if(typeof data?.declaracion.beneficiosPrivados.beneficio != 'undefined'){
                if(data?.declaracion.beneficiosPrivados.beneficio != null){
                  if(typeof data?.declaracion.beneficiosPrivados.beneficio[0].formaRecepcion != 'undefined'){
                    this.formaRecepcion = data?.declaracion.beneficiosPrivados.beneficio[0].formaRecepcion;
                    if(this.formaRecepcion=="" || this.formaRecepcion==null){
                      this.valido=false;
                      this.faltantes="II. Declaración de intereses - 6. Beneficios privados";
                      this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                    }              
                  }else{
                    this.valido=false;
                    this.faltantes="II. Declaración de intereses - 6. Beneficios privados";
                    this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                  }
                }else{
                  this.valido=false;
                  this.faltantes="II. Declaración de intereses - 6. Beneficios privados";
                  this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                }
              }else{
                this.valido=false;
                this.faltantes="II. Declaración de intereses - 6. Beneficios privados";
                this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
              }
            }
          }else{
            this.valido=false;
            this.faltantes="II. Declaración de intereses - 6. Beneficios privados";
            this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
          }
        }else{
          this.valido=false;
          this.faltantes="II. Declaración de intereses - 6. Beneficios privados";
          this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
        }
      }
    } catch (error) {
      console.log(error);
      this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }

  async getUserInfo_fideicomisos() {
    try {
      const { data, errors } = await this.apollo
        .query<DeclaracionOutput>({
          query: fideicomisosQuery,
          variables: {
            tipoDeclaracion: this.tipoDeclaracion.toUpperCase(),
          },
        })
        .toPromise();

      if (errors) {
        throw errors;
      }

      this.declaracionId = data?.declaracion._id;

      this.completa = !this.declaracionSimplificada;
      if(this.completa){
        if(typeof data?.declaracion.fideicomisos != 'undefined'){
          if(data?.declaracion.fideicomisos != null){
            if(typeof data?.declaracion.fideicomisos.ninguno == 'undefined'){
              if(typeof data?.declaracion.fideicomisos.fideicomiso != 'undefined'){
                if(data?.declaracion.fideicomisos.fideicomiso != null){
                  if(typeof data?.declaracion.fideicomisos.fideicomiso[0].tipoFideicomiso != 'undefined'){
                    this.tipoFideicomiso = data?.declaracion.fideicomisos.fideicomiso[0].tipoFideicomiso;
                    if(this.tipoFideicomiso=="" || this.tipoFideicomiso==null){
                      this.valido=false;
                      this.faltantes="II. Declaración de intereses - 7. Fideicomisos";
                      this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                    }              
                  }else{
                    this.valido=false;
                    this.faltantes="II. Declaración de intereses - 7. Fideicomisos";
                    this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                  }
                }else{
                  this.valido=false;
                  this.faltantes="II. Declaración de intereses - 7. Fideicomisos";
                  this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
                }
              }else{
                this.valido=false;
                this.faltantes="II. Declaración de intereses - 7. Fideicomisos";
                this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
              }
            }
          }else{
            this.valido=false;
            this.faltantes="II. Declaración de intereses - 7. Fideicomisos";
            this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
          }
        }else{
          this.valido=false;
          this.faltantes="II. Declaración de intereses - 7. Fideicomisos";
          this.openSnackBar('['+this.mensaje+this.faltantes+']', 'Aceptar');
        }
      }
    } catch (error) {
      console.log(error);
      this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }
}
