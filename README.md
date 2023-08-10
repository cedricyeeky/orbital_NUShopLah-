# Team NUShopLah!
NUShopLah! 
- Apollo 11 
- Mobile app developed for CP2106 Independent Software Development Project (Orbital) 2023

Team Members
- Freddy Chen You Ren
- Yee Kai Yang, Cedric

# Scope of Project:
About
- We hope to create a mobile application with an intuitive and simple to use user interface for a loyalty program within NUS premises to benefit NUS students, staff and retail shops/dining outlets on campus.

# Problem Motivation 

To allow NUS Students/Staff enjoy the exclusive benefits of a loyalty programme app specifically tailored for NUS Students/Staff when they patronize retail shops/dining places within the NUS Premises. 

Currently, there is no unified loyalty programme present on campus and payments mainly are through bank apps with no added benefits/returns. 
In light of the present economic outlook where many people value rewards programmes, we hope to provide a special, unified platform on campus to reward users for their spending our campus, where they spend a large portion of time everyday.


**Aim**

We want to create a seamless app with an intuitive user-interface for loyalty programme within NUS premises to benefit both NUS student and staff as well as retail shops/dining outlets on campus.

From the consumers’ perspective, they could use the app to earn points to exchange for rewards from participating brands located within NUS premises. This rewards them for their everyday spending on campus, besides merely paying the merchants. This app lets them view their spending habits too.

From the retailers’ perspective, they could use the opportunity of this loyalty scheme to promote their business, through the provision of cashback vouchers, as well as hosting seasonal “upsized points” promotions to boost sales (Increased rate of point accumulation). 


# User Stories

1. As a NUS student/staff, I would be able to gain points with every dollar that I spend at all retails within NUS premises and exchange for vouchers / rewards. These vouchers / rewards would save me some money in the long-run.

2. As a NUS Student/Staff, I would want track my expenditure and spending habits in NUS. (This is especially the case for those with tight financial budgets such as Exchange Students)

3. As a retailer of NUS, I can expect more students/staff to patronize my store as I offer vouchers in the loyalty app as well as introduce seasonal promotions in terms of “upsized points”. (Retailers may also include merchandise shops set up buy NUS clubs/societies)


# Completed Features

For our Loyalty Programme App, we have chosen to categorise our users into 2 main user types: Customer and Seller, and there is interactions between the two.

Key features:

(Common Features)
1.  Login and Register Screens, secured using Email and Password :white_check_mark:
2.  Forget Password function on Login Screen (sent through email link) :white_check_mark:
3.  Email Verification (sent through email link) upon account registration :white_check_mark:

(Customer)
1.  Home Screen 
- Voucher Catalogue (featuring colour-coded voucher cards with horizontal scrollview) :white_check_mark:
- Current Point Balance :white_check_mark:
- Logout button :white_check_mark:

2.  Activity Screen



# App Setup

**Ensure you have Node.js, npm, git and gitbash installed.**

**Clone this repository**

On gitbash, navigate to the folder you would like to place the cloned repository in.

After doing so, run the command:

```
git clone https://github.com/cedricyeeky/orbital_NUShopLah-.git
```

**Install dependencies**

Open up the project in VScode or any preferred code editor.

In the terminal, run:

```
npm install
```

This should install all the node.js dependencies required for the project.

Also ensure you install the react-native-dot-env package using the command:

```
npm i react-native-dotenv
```

This package is required to run the .env file which contains the API keys to access and use our firebase database. Please contact either Freddy or Cedric for the .env file.

After installing the react-native-dot-env package, place the .env file in the root directory of the project folder.

**Download the Expo Go app on IOS / Android**

In the terminal, input the command:

```
npx expo start --tunnel
```

(NOTE: Please only start the tunnel after you have put in the .env file in the root directory; else it will render invalid API keys due to the file not being read yet)

Scan the QR code on your phone camera app and wait for the project to build.
You may start using and testing our app after that!

# Tech Stack 
- React Native (Front End)
- Firebase (Back End)
- Git and Github (Version Control)
- Jest (Javascript Unit Testing)

**Database Usage**

We have successfully integrated Google firebase to to store and mange user data for authentication (email and password login).

We have managed to utilise Firebase to send authentication emails to new users to verify their email address, and users can also have the ability to change and forget their password.

Besides Firebase user authentication, we have utilised 2 other main Firebase features for our project: Firebase Firestore as well as Firebase storage function.

Firebase Firestore was used to create and store different collections of user data for the different components of our app (eg. Transactions collection, Vouchers collection).

Firebase storage function on the other hand was used to handle the storage of photo images for voucher cards created by Seller accounts.




