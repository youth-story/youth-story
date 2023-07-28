async function updateName(req, res, User) {
    try {
      const { newName } = req.body;
      const id = req.params.id;
  
      if (!newName || typeof newName !== 'string' || newName.trim().length === 0) {
        return res.status(400).send({ error: 'Invalid name. Please provide a valid name.' });
      }
  
      const updatedUser = await User.findByIdAndUpdate(id, { name: newName }, { new: true });
  
      if (!updatedUser) {
        return res.status(404).send('User not found');
      }
  
      return res.status(200).send('Name changed successfully' );
  
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).send('Something went wrong' );
    }
}

async function updateUserName(req, res, User) {
    try {
      const { newUserName } = req.body;
      const id = req.params.id;
  
      if (!newUserName || typeof newUserName !== 'string' || newUserName.trim().length === 0) {
        return res.status(400).send({ error: 'Invalid name. Please provide a valid name.' });
      }
  
      // Check if the new name is already taken
      const existingUser = await User.findOne({ username: newUserName });
      if (existingUser) {
        return res.status(409).send('Username already taken. Please choose a different name.');
      }
  
      const updatedUser = await User.findByIdAndUpdate(id, { username: newUserName }, { new: true });
  
      if (!updatedUser) {
        return res.status(404).send('User not found');
      }
  
      return res.status(200).send('Username changed successfully' );
  
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).send('Something went wrong' );
    }
  }

async function updateBio(req, res, User) {
    try {
        const { newBio } = req.body;
        const id = req.params.id;
    
        if (!newBio || typeof newBio !== 'string' || newBio.trim().length === 0) {
          return res.status(400).send('Invalid bio. Please provide a valid bio.');
        }
        else if (newBio.trim().length > 250)
        {
            return res.status(400).send('Max character limit is 250');
        }
    
        const updatedUser = await User.findByIdAndUpdate(id, { bio: newBio }, { new: true });
    
        if (!updatedUser) {
          return res.status(404).send('User not found');
        }
    
        return res.status(200).send('Bio updated successfully');
    
      } catch (error) {
        return res.status(500).send('Something went wrong');
      }
}

async function createGoal(req, res, Goal) {
    try {
      const { title} = req.body;
      const newGoal = await Goal.create({ title });
      res.status(201).send('Goal created Successfully');
    } catch (error) { 
      console.error('Error creating goal:', error);
      res.status(500).send('Failed to create goal');
    }
  }
  
  module.exports = {
    updateName: updateName,
    updateUserName: updateUserName,
    updateBio: updateBio,
    createGoal: createGoal,
  }
  