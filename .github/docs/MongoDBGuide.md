# Setting up MongoDB

1. Sign in or create an account for [MongoDB](https://www.mongodb.com/).

2. Create a database, choosing the "shared" option is recommended.

    ![image](./MongoDB_0.png)

    ![image](./MongoDB_1.png)

3. Make a user, you will need these credentials later.

    ![image](./MongoDB_2.png)

4. Add your own, or every IP address to the network access.

    ![image](./MongoDB_3.png)

5. Once the cluster has been deployed, click the connect button on it.

    ![image](./MongoDB_4.png)

6. Choose the "Connect your application" option.

    ![image](./MongoDB_5.png)

7. Now copy the URL.

    ![image](./MongoDB_6.png)

Be sure to replace `exampleUser` and `<password>` with the values from step 3.

For instance, in this example the final URL would be:

`mongodb+srv://exampleUser:examplePassword@cluster0.vqhbsse.mongodb.net/?retryWrites=true&w=majority`

Now you can paste the URL into `config.json`, done!
