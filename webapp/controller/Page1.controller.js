sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/formatter"
], function (BaseController, formatter) {
	"use strict";

	let aAllItems = [];

	return BaseController.extend("com.sap.build.standard.expediente.controller.Page1", {
		formatter: formatter,

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Page1").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		},

		handleRouteMatched: function (oEvent) {
			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;
			} else {
				var oComponentData = this.getOwnerComponent().getComponentData();
				if (oComponentData) {
					this.sContext = this._patternConvert(oComponentData.startupParameters);
				}
			}
			if (this.sContext) {
				var oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}
		},

		_patternConvert: function (oParam) {
			if (Object.keys(oParam).length !== 0) {
				for (var prop in oParam) {
					if (prop !== "sourcePrototype") {
						return prop + "(" + oParam[prop][0] + ")";
					}
				}
			}
		},

		consultainfo: function () {
			var noemp = this.byId("noemp").getValue();
			console.log("noemp", noemp);

			var that = this;
			var sPath = "/EmpleadoSet(NoEmp='" + noemp + "')";

			var aExpandEntities = ["Absentismos", "DescPuesto", "Direccion", "Escuela", "Familia", "Finiquitos", "Historia", "Mando", "Sanciones", "Vacaciones"];
			var sExpand = aExpandEntities.join(",");

			this.getOwnerComponent().getModel().read(sPath, {
				urlParameters: {
					"$expand": sExpand
				},
				success: function (oData) {
					console.log(oData);
					that._bindDataToView(sPath);

					that.updateEstadoForm(oData);
					that.setVacacionesModel(oData);
				},
				error: function (oError) {
					console.log("error", oError);
				}
			});
		},

		_bindDataToView: function (sPath) {
			var oView = this.getView();

			var aExpandEntities = ["Absentismos", "DescPuesto", "Direccion", "Escuela", "Familia", "Finiquitos", "Historia", "Mando", "Sanciones", "Vacaciones"];
			var sExpand = aExpandEntities.join(",");

			oView.bindElement({
				path: sPath,
				//? Asegura que las tablas anidadas se expanden y están disponibles en el View
				parameters: {
					expand: sExpand
				},
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oView.setBusy(true);
					},
					dataReceived: function () {
						oView.setBusy(false);
					}
				}
			});
		},

		_onBindingChange: function () {
			var oElementBinding = this.getView().getElementBinding();
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("notFound");
			}
		},

		/*var aFilter = new sap.ui.model.Filter("Begda", "EQ", fecha);
		oTable.getBinding("items").filter([aFilter]);
		*/

		setVacacionesModel: function (oData) {
			console.log(oData.Vacaciones);
			if (Array.isArray(oData.Vacaciones.results)) {
				var vacData = oData.Vacaciones.results.map(function (item) {
					return {
						Clase: item.Clase,
						Derecho: item.Derecho,
						FechaInicio: item.FechaInicio,
						FechaFinal: item.FechaFinal,
						Liquid: item.Liquid
					}
				});
				console.log(vacData)

				var oModel = new sap.ui.model.json.JSONModel({ Vacaciones: vacData });
				this.getView().setModel(oModel, "NewVacMod");

				// Enlazar la tabla a los datos procesados
				var oTable = this.byId("vacTable");
				oTable.setModel(oModel);
				oTable.bindItems({
					path: "NewVacMod>/Vacaciones",
					template: oTable.getBindingInfo("items").template
				});
			} else {
				console.error("Vacaciones no es un array");
			}
		},

		updateEstadoForm: function (oData) {
			var oForm = this.byId("formEstado");
			var finiqArray = oData.Finiquitos.results;
			
			// Verifica si ya existe un FormContainer con un ID específico
			var oExistingContainer = oForm.getFormContainers().find(function (container) {
				return container.getId() === "customFormContainer";
			});
		
			// Si el arreglo tiene elementos y no existe el FormContainer, añádelo
			if (finiqArray.length > 0 && !oExistingContainer) {
				var oLabelEstadoContr = this.byId("txtEstadoContr");
				oLabelEstadoContr.setText("Inactivo");
		
				var oNewFormContainer = new sap.ui.layout.form.FormContainer("customFormContainer", {
					formElements: [
						new sap.ui.layout.form.FormElement({
							label: "Fecha Baja",
							fields: new sap.m.Text({
								text: finiqArray[0].FechaTerm.toISOString().split('T')[0]
							})
						}),
						new sap.ui.layout.form.FormElement({
							label: "Motivo Baja",
							fields: new sap.m.Text({
								text: finiqArray[0].Motivo
							})
						})
					]
				});
		
				oForm.addFormContainer(oNewFormContainer);
			} 
			// Si el arreglo está vacío y existe el FormContainer, destrúyelo
			else if (finiqArray.length === 0 && oExistingContainer) {
				oForm.removeFormContainer(oExistingContainer);
				oExistingContainer.destroy();
				
				var oLabelEstadoContr = this.byId("txtEstadoContr");
				oLabelEstadoContr.setText("Activo");
			}
		},		


		getAbsentismosFiltered: function () {
			var oTable = this.byId("tableAbsentismos");
			var oBinding = oTable.getBinding("items");

			// Verificar si el binding tiene datos
			if (!oBinding) {
				sap.m.MessageToast.show("No se encontraron datos para filtrar.");
				return;
			}

			// Obtener el número total de registros
			var iTotalRecords = oBinding.getLength();

			// Verificar si todos los registros ya están cargados
			if (oBinding.getLength() !== oBinding.getContexts(0, iTotalRecords).length) {
				// Si no todos los registros están cargados, cargar más
				oBinding.attachEventOnce("dataReceived", function () {
					this.getAbsentismosFiltered(); // Reintentar el filtrado una vez que los datos estén cargados
				}.bind(this));

				// Cargar todos los registros
				oBinding.getContexts(0, iTotalRecords);
				return;
			}

			// Obtener el valor del input (fecha)
			var sFechaInput = this.byId("fechaAbsentismoInput").getValue();

			// Verificar si la fecha está en el formato correcto (dd.MM.yyyy)
			if (!sFechaInput) {
				sap.m.MessageToast.show("Por favor, ingrese una fecha válida.");
				return;
			}

			// Convertir la fecha al formato que se usa en el modelo (yyyy-MM-dd)
			var aFechaParts = sFechaInput.split(".");
			if (aFechaParts.length !== 3) {
				sap.m.MessageToast.show("El formato de la fecha debe ser dd.MM.yyyy.");
				return;
			}
			var sFechaFiltro = aFechaParts[2] + "-" + aFechaParts[1] + "-" + aFechaParts[0] + "T00:00:00.000Z";

			// Obtener los datos de la tabla (el contexto de cada item)
			var aContexts = oBinding.getContexts(0, iTotalRecords);
			var aItems = aContexts.map(function (oContext) {
				return oContext.getObject();
			});

			// Guardar los datos originales en el arreglo global
			aAllItems = aItems;

			// Filtrar los items localmente
			var aFilteredItems = aItems.filter(function (oItem) {
				// Comparar la fecha de Begda con la fecha ingresada
				var sBegda = new Date(oItem.Begda).toISOString(); // yyyy-MM-dd
				return sBegda === sFechaFiltro;
			});

			// Crear un nuevo modelo con los items filtrados
			var oFilteredModel = new sap.ui.model.json.JSONModel({ Absentismos: aFilteredItems });

			// Actualizar la tabla con el nuevo modelo
			oTable.setModel(oFilteredModel);

			// Actualizar el binding de la tabla para mostrar los items filtrados
			oTable.bindItems({
				path: "/Absentismos",
				template: oTable.getBindingInfo("items").template
			});
		},


		getAllAbsentismos: function () {
			var oTable = this.byId("tableAbsentismos");

			if (aAllItems.length === 0) {
				sap.m.MessageToast.show("No se encontraron datos para recargar.");
				return;
			}

			// Crear un nuevo modelo con todos los items originales
			var oModel = new sap.ui.model.json.JSONModel({ Absentismos: aAllItems });

			// Reestablecer el modelo en la tabla
			oTable.setModel(oModel);

			// Re-vincular los items de la tabla utilizando la información de binding original
			oTable.bindItems({
				path: "/Absentismos",
				template: oTable.getBindingInfo("items").template
			});

			sap.m.MessageToast.show("Todos los registros han sido recargados.");
		},
	});
}, /* bExport= */ true);