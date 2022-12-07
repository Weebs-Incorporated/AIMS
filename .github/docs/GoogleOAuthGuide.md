# Setting up Google OAuth

You'll want to follow the instructions from the [Google docs](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).

Your [credentials](https://console.cloud.google.com/apis/credentials) page should look something like this:

![image](../images//Google_1.png)

![image](../images/Google_0.png)

The **JavaScript origins** are the websites that are allowed to show the "sign in with Google" button.

The **Authorised redirect URIs** are the URIs that the button can redirect the user to after they sign in.

You will also need to set up the OAuth consent screen, however the only fields you _need_ to fill out are the app name, user support email, and the developer contact information.

Now, using the [VSCode live server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) you can navigate to the [googleLogin.html](../templates/googleLogin.html) file and log in!

Note that in this example, the live server was running on port 5001 (hence the `http://localhost:5001` in authorised JavaScript origins).
