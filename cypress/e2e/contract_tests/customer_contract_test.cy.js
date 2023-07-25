import { OrderPage } from "../../../pageobjects";

const EnvironmentConfig = require("microserviceautomationframework").EnvironmentConfig;
const ApplicationRoutes = require("microserviceautomationframework").ApplicationRoutes;

const orderFormQuery = "?orderId=0"
const orderStatusURL = ApplicationRoutes.order.default + ApplicationRoutes.order.orderStatus + orderFormQuery
const paymentURL = ApplicationRoutes.payment;

let customerId;

describe("Consumer driven contract verification for the Customer API", () => {

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

    })

    it("Verify the Contract between Order Status and Payment Call for paid orders", () => {

        cy.spyRequestOnRedirect(orderStatusURL, paymentURL + orderFormQuery + "&paymentStatus=false", "paidOrderInspect");

        cy.visit(EnvironmentConfig.getBaseUrl() + orderStatusURL, { failOnStatusCode: false });
        cy.wait("@paidOrderInspect")
        OrderPage.getOrderElement().should("have.text", "The order is not paid");
    })

    it("Verify the Contract between Order Status and Payment Call for not paid orders", () => {

        cy.spyRequestOnRedirect(orderStatusURL, paymentURL + orderFormQuery + "&paymentStatus=true", "notPaidOrderInspect");
        cy.visit(EnvironmentConfig.getBaseUrl() + orderStatusURL, { failOnStatusCode: false });
        cy.wait("@notPaidOrderInspect")
        cy.get("#orderStatus").should("have.text", "The order is paid ");
    })
})