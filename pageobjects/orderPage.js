const ORDER_STATUS_ID = "#orderStatus";


class OrderPage {
    
    static getOrderElement(){

        return cy.get(ORDER_STATUS_ID);
    }
}

export {OrderPage}