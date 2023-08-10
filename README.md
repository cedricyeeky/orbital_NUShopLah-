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

Key features:

1.  Login and Register Screens, secured using Email and Password :white_check_mark:
2.  Home page 
    - List of participating brands/retails for users to select and view rewards (indicative of points for voucher exchange) + seasonal promotions offered
    - User points balance
3.  Vouchers and Rewards Page. Ability to view both current vouchers purchased as well as past used vouchers. Current voucher purchased would have a validity period (expiry date).
4.  Personal QR code that is unique to each user to credit the points to each user’s account upon transaction.
5.  Account Page 
    - Name
    - Membership Tier Status (Note: The Membership tier status is calculated using the user’s points earned within a particular period; not their points balance at any particular time)
    - Activity Page (To view Transaction History and spending expenditure details)
    - Frequently Asked Questions (FAQ)
    -Feedback
    - Logout



# Our Proposed Timeline

Features
Completion Date
Login and Authentication Page - 20 May

Home page - 5 June

Generate Personal QR code - 1 June

Account Page - 10 June

Vouchers and Rewards page - 17 June

Testing (Round 1) - 26 June

Think about Extension - TBC

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

**Download the Expo Go app on IOS / Android**

In the terminal, input the command:

```
npx expo start --tunnel
```

Scan the QR code on your phone camera app and wait for the project to build.
You may start using and testing our app after that!

# Tech Stack 
- React Native (Front End)
- Firebase (Back End)
- Git and Github (Version Control)

**Database Usage**

Currently, we have successfully integrated Google firebase to to store and mange user data for authentication (email and password login).

We have also managed to utilise Firebase to send authentication emails to new users to verify their email address.

We are working on integrating Firestore to group user data into different categories.

# Software Diagram on Current App Navigation Flow

![NUShopLah! Flowchart Milestone 1 drawio](https://github.com/cedricyeeky/orbital_NUShopLah-/assets/108988934/c7a3ca26-6c8d-4237-911d-0e337aeed0fe)



