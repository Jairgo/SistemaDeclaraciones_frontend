import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatSelect } from '@angular/material/select';
import { Apollo } from 'apollo-angular';

import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@shared/dialog/dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

import { datosEmpleoCargoComisionQuery, declaracionMutation } from '@api/declaracion';
import { DeclarationErrorStateMatcher } from '@app/presentar-declaracion/shared-presentar-declaracion/declaration-error-state-matcher';
import { Catalogo, DatosEmpleoCargoComision, DeclaracionOutput } from '@models/declaracion';
import AmbitoPublico from '@static/catalogos/ambitoPublico.json';
import Estados from '@static/catalogos/estados.json';
import Municipios from '@static/catalogos/municipios.json';
import NivelOrdenGobierno from '@static/catalogos/nivelOrdenGobierno.json';
import Paises from '@static/catalogos/paises.json';
import { tooltipData } from '@static/tooltips/situacion-patrimonial/datos-empleo';
import { findOption } from '@utils/utils';
import { UntilDestroy, untilDestroyed } from '@app/@core';

@UntilDestroy()
@Component({
  selector: 'app-datos-empleo',
  templateUrl: './datos-empleo.component.html',
  styleUrls: ['./datos-empleo.component.scss'],
})
export class DatosEmpleoComponent implements OnInit {
  aclaraciones = false;
  aclaraciones2 = false;
  otroempleo = false;
  datosEmpleoCargoComisionForm: FormGroup;
  estado: Catalogo = null;
  estado2: Catalogo = null;
  isLoading = false;
  
  @ViewChild('tipoDomicilioInput') tipoDomicilioInput: MatSelect;
  @ViewChild('tipoDomicilioInput2', {static: false}) tipoDomicilioInput2: MatSelect;


  nivelOrdenGobiernoCatalogo = NivelOrdenGobierno;
  ambitoPublicoCatalogo = AmbitoPublico;
  estadosCatalogo = Estados;
  municipiosCatalogo = Municipios;
  paisesCatalogo = Paises;

  declaracionSimplificada = false;
  tipoDeclaracion: string = null;
  tipoDomicilio: string = null;
  tipoDomicilio2: string = null;

  declaracionId: string = null;

  tooltipData = tooltipData;
  errorMatcher = new DeclarationErrorStateMatcher();

  constructor(
    private apollo: Apollo,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    const urlChunks = this.router.url.split('/');
    this.declaracionSimplificada = urlChunks[2] === 'simplificada';
    this.tipoDeclaracion = urlChunks[1] || null;

    this.createForm();
    this.getUserInfo();
  }

  confirmSaveInfo() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Guardar cambios',
        message: '',
        trueText: 'Guardar',
        falseText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.saveInfo();
      }
    });
  }

  createForm() {
    this.datosEmpleoCargoComisionForm = this.formBuilder.group({
      nivelOrdenGobierno: [null, [Validators.required]],
      ambitoPublico: [null, [Validators.required]],
      nombreEntePublico: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      areaAdscripcion: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      empleoCargoComision: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      contratadoPorHonorarios: [null, [Validators.required]],
      nivelEmpleoCargoComision: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      funcionPrincipal: [null, [Validators.required, Validators.pattern(/^\S.*\S$/)]],
      fechaTomaPosesion: [null, [Validators.required]],
      telefonoOficina: this.formBuilder.group({
        telefono: [null, [Validators.pattern(/^\d{10}$/)]],
        extension: [null, [Validators.pattern(/^\d{1,10}$/)]],
      }),
      domicilioMexico: this.formBuilder.group({
        calle: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
        numeroExterior: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
        numeroInterior: [null, [Validators.pattern(/^\S.*$/)]],
        coloniaLocalidad: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
        municipioAlcaldia: [{ disabled: true, value: null }, [Validators.required]],
        entidadFederativa: [null, [Validators.required]],
        codigoPostal: [null, [Validators.required, Validators.pattern(/^\d{5}$/i)]],
      }),
      domicilioExtranjero: this.formBuilder.group({
        calle: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
        numeroExterior: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
        numeroInterior: [null, [Validators.pattern(/^\S.*$/)]],
        ciudadLocalidad: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
        estadoProvincia: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
        pais: [null, [Validators.required]],
        codigoPostal: [null, [Validators.required, Validators.pattern(/^\d{5}$/i)]],
      }),
      aclaracionesObservaciones: [
        { disabled: true, value: '' },
        [Validators.required, Validators.pattern(/^\S.*\S?$/)],
      ],
      cuentaConOtroCargoPublico: [
        { disabled: this.tipoDeclaracion !== 'modificacion', value: null },
        [Validators.required],
      ],
      otroEmpleoCargoComision: this.formBuilder.group({
        nivelOrdenGobierno: [null],
        ambitoPublico: [null],
        nombreEntePublico: [null, [Validators.pattern(/^\S.*\S$/)]],
        areaAdscripcion: [null, [Validators.pattern(/^\S.*\S$/)]],
        empleoCargoComision: [null, [Validators.pattern(/^\S.*\S$/)]],
        contratadoPorHonorarios: [null],
        nivelEmpleoCargoComision: [null, [Validators.pattern(/^\S.*\S$/)]],
        funcionPrincipal: [null, [Validators.pattern(/^\S.*\S$/)]],
        fechaTomaPosesion: [null],
        telefonoOficina: this.formBuilder.group({
          telefono: [null, [Validators.pattern(/^\d{10}$/)]],
          extension: [null, [Validators.pattern(/^\d{1,10}$/)]],
        }),
        domicilioMexico: this.formBuilder.group({
          calle: [null, [Validators.pattern(/^\S.*$/)]],
          numeroExterior: [null, [Validators.pattern(/^\S.*$/)]],
          numeroInterior: [null, [Validators.pattern(/^\S.*$/)]],
          coloniaLocalidad: [null, [Validators.pattern(/^\S.*$/)]],
          municipioAlcaldia: [{ disabled: true, value: null }],
          entidadFederativa: [null],
          codigoPostal: [null, [Validators.pattern(/^\d{5}$/i)]],
        }),
        domicilioExtranjero: this.formBuilder.group({
          calle: [null, [Validators.pattern(/^\S.*$/)]],
          numeroExterior: [null, [Validators.pattern(/^\S.*$/)]],
          numeroInterior: [null, [Validators.pattern(/^\S.*$/)]],
          ciudadLocalidad: [null, [Validators.pattern(/^\S.*$/)]],
          estadoProvincia: [null, [Validators.pattern(/^\S.*$/)]],
          pais: [null],
          codigoPostal: [null, [Validators.pattern(/^\d{5}$/i)]],
        }),
        aclaracionesObservaciones: [
          { disabled: true, value: '' },
          [Validators.pattern(/^\S.*\S?$/)],
        ],
      }),
    });
    
    // this.datosEmpleoCargoComisionForm.get('domicilioExtranjero').disable();

    const estado = this.datosEmpleoCargoComisionForm.get('domicilioMexico').get('entidadFederativa');
    estado.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      const municipio = this.datosEmpleoCargoComisionForm.get('domicilioMexico').get('municipioAlcaldia');

      if (value) {
        municipio.enable();
      } else {
        municipio.disable();
        municipio.reset();
      }
      this.estado = value;
    });

    const estado2 = this.datosEmpleoCargoComisionForm.get('otroEmpleoCargoComision').get('domicilioMexico').get('entidadFederativa');
    estado2.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      const municipio2 = this.datosEmpleoCargoComisionForm.get('otroEmpleoCargoComision').get('domicilioMexico').get('municipioAlcaldia');

      if (value) {
        municipio2.enable();
      } else {
        municipio2.disable();
        municipio2.reset();
      }
      this.estado2 = value;      
    });
  }

  fillForm(datosEmpleoCargoComision: DatosEmpleoCargoComision | undefined) {
    this.datosEmpleoCargoComisionForm.patchValue(datosEmpleoCargoComision || {});

    if (datosEmpleoCargoComision?.aclaracionesObservaciones) {
      this.toggleAclaraciones(true);
    }
    this.setSelectedOptions(datosEmpleoCargoComision);    

    if (this.tipoDeclaracion.toLowerCase()==='modificacion'){         
      if (datosEmpleoCargoComision?.cuentaConOtroCargoPublico) {
        this.toggleOtroEmpleoCargoComision(true,false);        
        if (datosEmpleoCargoComision?.otroEmpleoCargoComision.aclaracionesObservaciones) {          
          this.toggleAclaraciones2(true);
        } else {
          this.toggleAclaraciones2(false);
        }        
        this.setSelectedOptions2(datosEmpleoCargoComision);
      }
    }else {
      this.toggleOtroEmpleoCargoComision(false,true);      
    }    
  }

  async getUserInfo() {
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
      this.fillForm(data?.declaracion.datosEmpleoCargoComision);
      
    } catch (error) {
      console.log(error);
      this.openSnackBar('[ERROR: No se pudo recuperar la información]', 'Aceptar');
    }
  }

  formHasChanges() {
    let url = '/' + this.tipoDeclaracion;
    if (this.declaracionSimplificada) url += '/simplificada';
    let isDirty = this.datosEmpleoCargoComisionForm.dirty;
    console.log(isDirty);

    if (isDirty) {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          title: 'Tienes cambios sin guardar',
          message: '¿Deseas continuar?',
          falseText: 'Cancelar',
          trueText: 'Continuar',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) this.router.navigate([url + '/situacion-patrimonial/experiencia-laboral']);
      });
    } else {
      this.router.navigate([url + '/situacion-patrimonial/experiencia-laboral']);
    }
  }

  ngOnInit(): void {}

  openSnackBar(message: string, action: string = null) {
    this.snackBar.open(message, action, {
      duration: 5000,
    });
  }

  async saveInfo() {
    try {
      this.isLoading = true;
      const declaracion = {
        datosEmpleoCargoComision: this.datosEmpleoCargoComisionForm.value,
      };

      const { errors } = await this.apollo
        .mutate({
          mutation: declaracionMutation,
          variables: {
            id: this.declaracionId,
            declaracion,
          },
        })
        .toPromise();

      if (errors) {
        throw errors;
      }

      this.isLoading = false;
      this.openSnackBar('Información actualizada', 'Aceptar');
    } catch (error) {
      console.log(error);
      this.openSnackBar('[ERROR: No se guardaron los cambios]', 'Aceptar');
    }
  }

  setSelectedOptions(datosEmpleoCargoComision: DatosEmpleoCargoComision) {
    const { domicilioExtranjero, domicilioMexico } = datosEmpleoCargoComision ?? {};

    if (domicilioMexico) {
      this.datosEmpleoCargoComisionForm
        .get('domicilioMexico.entidadFederativa')
        .setValue(findOption(this.estadosCatalogo, domicilioMexico.entidadFederativa?.clave));
      this.datosEmpleoCargoComisionForm
        .get('domicilioMexico.municipioAlcaldia')
        .setValue(
          findOption(this.municipiosCatalogo[this.estado?.clave] || [], domicilioMexico.municipioAlcaldia?.clave)
        );
      this.tipoDomicilioInput.writeValue('MEXICO');
      this.tipoDomicilioChanged('MEXICO');
    } else if (domicilioExtranjero) {
      this.tipoDomicilioInput.writeValue('EXTRANJERO');
      this.tipoDomicilioChanged('EXTRANJERO');
    }
  }

  setSelectedOptions2(datosEmpleoCargoComision: DatosEmpleoCargoComision) {
    const {  otroEmpleoCargoComision } = datosEmpleoCargoComision ?? {};
    this.changeDetectorRef.detectChanges();        
    
    if (otroEmpleoCargoComision) {
      
      if (otroEmpleoCargoComision.domicilioMexico) {        
        this.datosEmpleoCargoComisionForm
          .get('otroEmpleoCargoComision').get('domicilioMexico.entidadFederativa')
          .setValue(findOption(this.estadosCatalogo, otroEmpleoCargoComision.domicilioMexico.entidadFederativa?.clave));
        this.datosEmpleoCargoComisionForm
          .get('otroEmpleoCargoComision').get('domicilioMexico.municipioAlcaldia')
          .setValue(
            findOption(this.municipiosCatalogo[this.estado2?.clave] || [], otroEmpleoCargoComision.domicilioMexico.municipioAlcaldia?.clave)
          );                     
        this.tipoDomicilioInput2.writeValue('MEXICO');                  
        this.tipoDomicilio2Changed('MEXICO');          
      } else if (otroEmpleoCargoComision.domicilioExtranjero) {                              
        this.tipoDomicilioInput2.writeValue('EXTRANJERO');                        
        this.tipoDomicilio2Changed('EXTRANJERO');                
      }              

    }
  }

  tipoDomicilioChanged(value: string) {
    this.tipoDomicilio = value;
    const notSelectedType = this.tipoDomicilio === 'MEXICO' ? 'domicilioExtranjero' : 'domicilioMexico';
    const selectedType = this.tipoDomicilio === 'EXTRANJERO' ? 'domicilioExtranjero' : 'domicilioMexico';

    const notSelected = this.datosEmpleoCargoComisionForm.get(notSelectedType);
    notSelected.disable();
    notSelected.reset();

    this.datosEmpleoCargoComisionForm.get(selectedType).enable();
  }

  tipoDomicilio2Changed(value: string) {    
    this.tipoDomicilio2 = value;
    this.changeDetectorRef.detectChanges();
    
    const notSelectedType = this.tipoDomicilio2 === 'MEXICO' ? 'domicilioExtranjero' : 'domicilioMexico';
    const selectedType = this.tipoDomicilio2 === 'EXTRANJERO' ? 'domicilioExtranjero' : 'domicilioMexico';

    const notSelected = this.datosEmpleoCargoComisionForm.get('otroEmpleoCargoComision').get(notSelectedType);
    notSelected.disable();
    notSelected.reset();

    this.datosEmpleoCargoComisionForm.get('otroEmpleoCargoComision').get(selectedType).enable();
  }

  toggleAclaraciones(value: boolean) {
    const aclaraciones = this.datosEmpleoCargoComisionForm.get('aclaracionesObservaciones');
    if (value) {
      aclaraciones.enable();
    } else {
      aclaraciones.disable();
      aclaraciones.reset();
    }
    this.aclaraciones = value;
  }

  toggleAclaraciones2(value: boolean) {    
    const aclaraciones2 = this.datosEmpleoCargoComisionForm.get('otroEmpleoCargoComision').get('aclaracionesObservaciones');
    if (value) {      
      aclaraciones2.enable();      
    } else {      
      aclaraciones2.disable();      
      aclaraciones2.reset();      
    }        
    this.aclaraciones2 = value;        
  }

  toggleOtroEmpleoCargoComision(value: boolean, borrar: boolean) {        
    const otroEmpleo = this.datosEmpleoCargoComisionForm.get('otroEmpleoCargoComision');        
    if (value) {            
      otroEmpleo.enable();            
    } else {            
      otroEmpleo.disable();                  
      otroEmpleo.reset();            
    }    
    this.otroempleo = value;        
    if (borrar){
      this.toggleAclaraciones2(false);
    }    
  }
}