import { createSlice } from "@reduxjs/toolkit";
import products from "../data/products";
const initialState={

products:products,
selctedProduct : null , 
};
export const productsSlice = createSlice({
name:'products',
initialState,
reducers:{
    setSelectedProduct : (state ,action )=>{
        console.log("action " , action ) ; 
        console.log("state" , state  ) ; 
        
    }
}

})