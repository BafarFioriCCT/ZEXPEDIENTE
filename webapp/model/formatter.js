 sap.ui.define([], function () {
	"use strict";
	return{
		convertgenero : function (genero){
			if(!genero){
				return " ";
			}
			else{
				if (genero === "1"){
				return "Masculino";
				}
				else{
					return "Femenino";
				}
			}
		},
		convertedocivil : function (edo){
			switch(edo){
				case "0":
					return "Soltero";
				break;
				case "1":
					return "Casado";
				break;
				case "2":
					return "Viudo";
				break;
				case "3":
					return "Divorciado";
				break;
				case "4":
					return "Separado";
				break;
				case "5":
					return "Union Libre";
			}
		},
		convertescuela : function (esc){
			switch(esc){
				case "01":
					return "Sin Titulo";
				break;
				case "02":
					return "Con Titulo";
				break;
				case "03":
					return "Certificado";
			}
		},
	 };
});