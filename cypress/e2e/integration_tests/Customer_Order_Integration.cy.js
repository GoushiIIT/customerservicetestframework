const RequestStatusCodes = require("microserviceautomationframework").RequestStatusCodes

describe("Verify the integration between Customer and Order API", () => {

    it("Verify unable to create an order without a Customer", () => {

        cy.getAllCustomerDetails().then(response => {

            const numberOfCustomers = response.body.length;

            cy.createOrderViaAPI(
                numberOfCustomers,
                "2022-01-01"
            ).then(response => {

                expect(response.status).to.eq(RequestStatusCodes.ERROR);
            })
        })
    });

    it("Verify able to create an order with a valid Customer", () => {

        cy.getAllCustomerDetails().then(response => {

            const numberOfCustomers = response.body.length;

            if(numberOfCustomers == 0){

                cy.getData("cypress/fixtures/customerData.enc").then(customerData => {

                cy.createCustomerViaAPI(
                    customerData.customerName,
                    customerData.customerAddress
                ).then(customerResponse => {

                    expect(customerResponse.status).to.eq(RequestStatusCodes.INFO);

                })
            });

            }
            cy.createOrderViaAPI(
                numberOfCustomers-1,
                "2022-01-01"
            ).then(validOrderResponse => {

                expect(validOrderResponse.status).to.eq(RequestStatusCodes.INFO);
            })
        })
    });

})