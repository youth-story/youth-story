 // Send OTP to user
 function sendWelcomeMail(name, email, official_email, Sib) {

    const tranEmailApi = new Sib.TransactionalEmailsApi();

    const sender = {
        email: 'curiosity.avidew@gmail.com',
        name: 'Aviral Dewan',
    }
    const receivers = [
        {
            email: email,
        },
    ]

    return tranEmailApi
    .sendTransacEmail({
        sender,
        to: receivers,
        subject: 'Welcome to Youth Story - Empowering Your Journey to Success!',
        htmlContent: `
        <h1>Welcome</h1>
        <h3>Dear ${name}</h3>
        <p>Welcome to Youth Story! We're thrilled to have you join our community of ambitious individuals who are determined to make a mark and achieve great heights at a young age.
        <br>
        At Youth Story, we believe in the power of stories and the inspiration they hold. Our platform offers a wealth of resources, knowledge, and opportunities to help you navigate your path to success. Here's a quick overview of what you can expect:
        <br>
        Inspiring Magazines: Access our exclusive collection of magazines featuring insightful articles, success stories, and interviews with young achievers. Learn from their experiences, strategies, and tips to fuel your aspirations.
        <br>
        Success Stories and Blogs: Dive into our treasure trove of success stories and blogs that showcase remarkable achievements of young individuals. Get inspired by their journeys, challenges, and triumphs as they share valuable insights.
        <br>
        Empowering Interviews: Gain valuable insights from in-depth interviews with young achievers who have excelled in their fields. Discover their secrets, strategies, and the mindset that helped them reach great heights at a young age.
        <br>
        Social Forum: Connect with like-minded individuals through our vibrant social forum. Set goals, track your progress, and engage with the community by sharing your achievements, challenges, and milestones.
        <br>
        We're here to support you every step of the way. If you have any questions, need guidance, or want to share feedback, our dedicated support team is ready to assist you.
        <br>
        Get ready to embark on an incredible journey of personal growth, inspiration, and achievement. Your story is worth sharing, and we can't wait to witness your progress and success.
        <br>
        Once again, welcome to Youth Story! Start exploring, connecting, and charting your path to greatness.
        <br>
        Best regards,
        Youth Story team</p>
        `,
    })
    .then(()=> {
        return 200
    })
    .catch(()=> {
        return 500
    });
  
  }

async function createNewUser(req, res, jwt, User, bcrypt, sendinblueClient, official_email) {
    try {
      const { name, email, password, username } = req.body;
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }
  
      const usernameTaken = await User.findOne({ username });
      if (usernameTaken) {
        return res.status(400).json({ error: 'Username not available' });
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
  
      // Create a new user
      const newUser = new User({ name, email, password: hashedPassword, username });
      await newUser.save();

      // const response = await sendWelcomeMail(name, email, official_email, sendinblueClient);
      // if (response === 500)
      // {
      //   return res.status(500).json({ error: 'Failed to send welcome mail' });
      // }
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  async function loginUser(req, res, jwt, User, bcrypt) {
    try {
        const { email, password, rememberMe } = req.body;
    
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
    
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
    
        // Generate JWT token
        const token = jwt.sign({ user: user.id }, process.env.JWT_SECRET, {
          expiresIn: rememberMe ? '7d' : '1h', // Set token expiration based on rememberMe value
        });
    
        res.json({ token });
      } catch (err) {
        res.status(500).json({ error: 'Server error' });
      }
  }
  
// Generate OTP
function generateOTP() {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }
  
  // Send OTP to user
 async function sendOTP(email, otp, official_email, Sib) {
    const tranEmailApi = new Sib.TransactionalEmailsApi();

    const sender = {
        email: 'curiosity.avidew@gmail.com',
        name: 'Aviral Dewan',
    }
    const receivers = [
        {
            email: email,
        },
    ]

   try { 
    await tranEmailApi
    .sendTransacEmail({
        sender,
        to: receivers,
        subject: 'OTP for Verification - Youth Story',
        htmlContent: `
        <p>Welcome to Youth Story! We're thrilled to have you join our community of ambitious individuals who are determined to make a mark and achieve great heights at a young age.
        <br>
        Please find your OTP: <bold>${otp}</bold>
        <br>
        Best regards,
        Youth Story team</p>
        `,
    });

    console.log(otp);

    return 200;
    }
    catch(err)
    {
        return 500;
    }
  }
  
  async function requestOTP(req, res, OTP, sendinblueClient, official_email, User) {
    const { email, username } = req.body;

    let foundUser = await User.findOne({email: email});
    if (foundUser)
    {
        return res.status(409).json({ error: 'Email already registered' });
    }
    foundUser = await User.findOne({username: username});
    if (foundUser)
        return res.status(409).json({ error: 'Username not available' });
    foundUser = await OTP.findOne({email: email});
    if (foundUser)
    {
        await OTP.deleteMany({email: email});
    }
  
    try {
      // Generate OTP
      const otp = generateOTP();
  
      // Send OTP to user's email
      const response = await sendOTP(email, otp, official_email, sendinblueClient);
      if (response === 500)
      {
        return res.status(500).json({ error: 'Failed to send OTP' });
      }
  
      // Store the OTP and associated email
      const newOTP = new OTP({ email, otp });
      await newOTP.save();
  
      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }
  
  async function verifyOTP(req, res, OTP) {
    const { email, otp } = req.body;
  
    try {
      // Retrieve the stored OTP for the email
      const storedOtp = await OTP.findOne({ email: email });
  
      if (!storedOtp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
  
      if (storedOtp.otp != otp) {
        return res.status(400).json({ error: 'Incorrect OTP' });
      }
  
      // Check if OTP has expired
      const currentTime = Date.now();
      const otpExpiry = storedOtp.createdAt.getTime() + 5 * 60 * 1000; // OTP is valid for 5 minutes
  
      if (currentTime > otpExpiry) {
        // OTP has expired
        await OTP.deleteOne({ email: email });
        return res.status(400).json({ error: 'OTP has expired' });
      }
  
      // Clear the stored OTP
      await OTP.deleteOne({ email: email });
      
      res.status(200).json({ message: 'OTP Verified' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  }

  async function forgotPassword(req, res, User, bcrypt) {
    const { newPassword, confirmPassword, email } = req.body;
    
    if (newPassword.trim().length < 8 || newPassword.includes(' ')) {
      return res.status(400).json({ error: 'Password must be 8 characters long and without spaces' });
    } else if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    try {
      const user = await User.findOne({ email: email });
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await user.updateOne({ password: hashedPassword });
      await user.save();
    
      return res.status(200).send('Password Changed Successfully');
    }
    catch(error)
    {
      return res.status(500).send('Something Went Wrong');
    }
  }  

  module.exports = {
    createNewUser: createNewUser,
    loginUser: loginUser,
    requestOTP: requestOTP,
    verifyOTP: verifyOTP,
    forgotPassword: forgotPassword,
  }