import { RequestMethodType, RequestStatusCodes } from "microserviceautomationframework/cypress/constants";

describe("Order API Component Tests", () => {

    let customerId;

    before(() => {

        //Create the customer if not exists
        cy.getAllCustomerDetails().then(response => {

            const numberOfCustomers = response.body.length;

            if (numberOfCustomers == 0) {

                cy.getData("cypress/fixtures/customerData.enc").then(customerData => {

                    cy.createCustomerViaAPI(
                        customerData.customerName,
                        customerData.customerAddress
                    ).then(customerResponse => {

                        expect(customerResponse.status).to.eq(RequestStatusCodes.INFO);
                        customerId = customerResponse.body[customerResponse.body.length - 1].id
                    })
                });

            }
            else {
                customerId = response.body[numberOfCustomers - 1].id

            }
        })

    })

    it("Verify Order can be added successfully", () => {

        cy.createOrderViaAPI(
            customerId,
            "2022-01-01"
        ).then(validOrderResponse => {

            expect(validOrderResponse.status).to.eq(200);

            var orderItem = validOrderResponse.body[validOrderResponse.body.length - 1]
            expect(orderItem.id).to.eq(validOrderResponse.body.length - 1)
            expect(orderItem.customer.id).to.eq(customerId)
            expect(orderItem.datePlaced).to.include("2022-01-01");
        })
    });

    it("Verify the order can be received by customer id", () => {

        cy.getOrderByCustomerId(customerId).then(orderIdResponse => {

            expect(orderIdResponse.status).to.eq(RequestStatusCodes.INFO);

            //Verify Customer is correctly displayed
            var orderItem = orderIdResponse.body[orderIdResponse.body.length - 1]
            expect(orderItem.customer.id).to.eq(customerId)

        })
    });
})