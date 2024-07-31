sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"../model/formatter"
], function (BaseController, MessageBox, Utilities, History, formatter) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.expediente.controller.Page1", {
		formatter: formatter,
		handleRouteMatched: function (oEvent) {
			var sAppId = "App5caba8b0ac978647ebab43ef";

			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function (oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype") {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}

			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}

		},
		consultainfo    : function () {
			var noemp = this.byId("noemp").getValue();
			console.log("noemp", noemp);
			var lv_Error;
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			var that=this;
			var Objeto = "/EmpleadoSet(NoEmp='" + noemp + "')";
			
			this.getOwnerComponent().getModel().read("/EmpleadoSet(NoEmp='" + noemp + "')", {
				
				success: function (oData, oResponse) {
					console.log(oData);
					console.log("response", oResponse);
					that.getView().bindElement({path:Objeto});
				},
				error: function (oError) {
					lv_Error = oError;
					console.log("error", lv_Error);
				}
			});
		},
		_onFileUploaderChange: function () {
			// Please implement

		},
		_onFileUploaderTypeMissmatch: function () {
			// Please implement

		},
		_onFileUploaderFileSizeExceed: function () {
			// Please implement

		},
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Page1").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		}
	});
}, /* bExport= */ true);