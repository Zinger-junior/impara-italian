# Setting up accounts (Netlify Identity)

Your app now has sign-up / log-in built in, using **Netlify Identity**. Each
person who signs up gets their own account, and their progress (lessons, scores,
vocabulary, mistakes, study days) is saved to that account — so they can log in
on any device and pick up where they left off.

You don't need a database, a `.env` file, or any keys. Everything lives inside
Netlify. Follow these steps once.

---

## 1. Push the new code

In GitHub Desktop: **Commit** the changes, then **Push origin**. Netlify will
automatically build and deploy the new version (this takes a minute or two).

> Netlify installs the new `netlify-identity-widget` package for you during the
> build — you don't have to do anything for that.

## 2. Turn on Identity in Netlify

1. Go to your site's dashboard on **app.netlify.com**.
2. In the left menu, open **Site configuration** (older accounts call it
   **Site settings**).
3. Find **Identity** in that menu and click it.
4. Click **Enable Identity**.

That's it — Netlify creates the login system for your site automatically.

## 3. Choose who can sign up

Still on the Identity page, look at **Registration preferences**:

- **Open** — anyone who visits can create an account. Fine if you want to share
  the app with friends.
- **Invite only** — only people you invite can join. Best if the app is just for
  you. If you pick this, click **Invite users**, type your own email, and accept
  the invite email to create your account.

You can change this anytime.

## 4. (If login errors) trigger one more deploy

Once in a while the site needs a fresh deploy to notice Identity is on. If the
login box shows an error the first time, go to **Deploys → Trigger deploy →
Deploy site**, wait for it to finish, then try again.

## 5. Sign up and confirm your email

1. Open your **live site** (the `https://…netlify.app` address).
2. Click **Create account**, enter an email and password.
3. Netlify emails you a **confirmation link** — click it.
4. Come back and **Log in**. You'll get the short setup survey, then the app.

**Forgot your password?** Click **Log in**, then **Forgot password?** in the box
that pops up — Netlify emails you a reset link.

---

## Important things to know

- **Test on the live site, not on your computer.** Netlify Identity only works on
  the deployed `https://…netlify.app` site. When you run the app locally
  (`npm run dev`), it skips login on purpose and just uses local data on that
  machine — so you can keep building without signing in.
- **Your progress is saved to your account.** When you finish a lesson, add a
  word, etc., the app quietly saves a copy to your Netlify account. Log in on a
  new device and it comes back.
- **Signing out clears this device.** When you sign out, the app wipes the local
  copy so the next person on that browser starts clean. Your progress is safe in
  your account and returns when you log back in.
- **Resetting progress** (Settings → Danger zone) also clears the saved copy in
  your account, so a reset is permanent across devices.

## Where the progress is stored (for the curious)

Each account's progress is saved inside that user's Identity profile, in a field
Netlify calls `user_metadata`. It's a small chunk of JSON — plenty of room for a
learner's progress. No separate database or server code is involved.
