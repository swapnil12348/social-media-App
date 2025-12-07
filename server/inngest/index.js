import { Inngest } from "inngest";
import User from "../models/User.js";


// Create a client to send and receive events
export const inngest = new Inngest({ id: "pingup-app" });

// inngest funtion to save user data to a database

const syncUserCreation = inngest.createFunction(
    {id:'sync-user-from-clerk'},
    {event:'clerk/User.created'},
    async({event, step})=>{
        const {id,first_name, last_name, email_addresses, image_url} = event.data;
        let username=email_addresses[0].email_address.split('@')[0]

        // chrck availability of username

        const user=await User.findOne({username})
        if (user) {
            username=username+Math.floor(Math.random()*10000)
        }

        const userData={
            _id:id,
            email:email_addresses[0].email_address,
            full_name:first_name+' '+last_name,
            profile_picture:image_url,
            username
        }

        await User.create(userData)
    }
)

// inngest function to update user data in database

const syncUserUpdation = inngest.createFunction(
    {id:'update-user-from-clerk'},
    {event:'clerk/User.deleted'},
    async({event, step})=>{
        const {id} = event.data;
        await User.findByIdAndDelete(id)

  

       


    }
)

// inngest functions to delete user form datatbase

const syncUserDeletion = inngest.createFunction(
    {id:'delte-user-with-clerk'},
    {event:'clerk/User.updated'},
    async({event, step})=>{
        const {id,first_name, last_name, email_addresses, image_url} = event.data;

        const updatedUserData={
            email:email_addresses[0].email_address,
            full_name:first_name+' '+last_name,
            profile_picture:image_url,
        }

        await User.findByIdAndUpdate(id, updatedUserData)
       


    }
)


// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];