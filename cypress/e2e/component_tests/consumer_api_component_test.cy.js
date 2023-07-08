import { RequestStatusCodes, RequestMethodType } from "microserviceautomationframework/cypress/constants";
import { EnvironmentConfig, ProductConfig } from "microserviceautomationframework/cypress/configs";

describe("Consumer API Component Tests", () => {

    let createdCustomerPayload;

    let addedCustomerId;

    it("Verify Customer can be added successfully", () => {

        cy.getData("cypress/fixtures/customerData.enc").then(customerData => {

            debugger;
            createdCustomerPayload = customerData;

            cy.createCustomerViaAPI(
                customerData.customerName,
                customerData.customerAddress
            ).then(customerResponse => {

                expect(customerResponse.status).to.eq(RequestStatusCodes.INFO);
                var addedCustomer = customerResponse.body[customerResponse.body.length - 1];

                expect(addedCustomer.id).to.eq(customerResponse.body.length - 1);
                expect(addedCustomer.customerName).to.eq(createdCustomerPayload.customerName);
                expect(addedCustomer.customerAddress).to.eq(createdCustomerPayload.customerAddress);

                addedCustomerId = addedCustomer.id;
            })

        });
    });

    it("Verify all the customers can be received successfully", () => {

        debugger;
        cy.getAllCustomerDetails().then(customerResponse => {

            expect(customerResponse.status).to.eq(RequestStatusCodes.INFO);

        })
    });

    it("Verify an added customer can be received by the customer id successfully", () => {

        cy.getCustomerById(addedCustomerId).then(customerIdResponse => {

            expect(customerIdResponse.status).to.eq(RequestStatusCodes.INFO);

            var addedCustomer = customerIdResponse.body;

            expect(addedCustomer.id).to.eq(addedCustomerId);
            expect(addedCustomer.customerName).to.eq(createdCustomerPayload.customerName);
            expect(addedCustomer.customerAddress).to.eq(createdCustomerPayload.customerAddress);

        })
    });

    it("Verify customer endpoint cannot be accessed without basic authorization", () => {

        cy.executeAPIRequest(
            RequestMethodType.Get,
            ProductConfig.ApplicationRoutes.customer,
            null,
            false
        ).then(response => {
    
            expect(response.status).to.eq(RequestStatusCodes.UNAUTHORIZED);
        });
    });
})