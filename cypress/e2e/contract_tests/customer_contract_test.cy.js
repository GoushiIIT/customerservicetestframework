import { OrderPage } from "../../../pageobjects";

const EnvironmentConfig = require("microserviceautomationframework").EnvironmentConfig;
const ApplicationRoutes = require("microserviceautomationframework").ApplicationRoutes;

const orderFormQuery = "?orderId=0"
const orderStatusURL = ApplicationRoutes.order.default + ApplicationRoutes.order.orderStatus + orderFormQuery
const paymentURL = ApplicationRoutes.payment

describe("Consumer driven contract verification for the Customer API", () => {

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