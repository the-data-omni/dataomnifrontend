export const schema = `
table Transaction{
  id: number;
  title: string;
  author: User;
  comments: Comment[];
  createdAt: Date;
  id: ;
    order_id: ORDER
    refund_id: REFUND
    location_id: LOCATION
    
}

table ORDER{
  id: number;
  text: string;
}

table LOCATION{
  id: number;
  name: string;
  email: string;
}

table REFUND{
    id: string;
    order_id: ORDER;
    user_id: USER;
}

`;