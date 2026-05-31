const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, '../server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

const anchor = `  res.json(clientUser);
});`;

const apiCode = `

// --- FRIENDS API ---

// Get friends data (friends, requests in, requests out)
app.get("/api/friends/:id", async (req, res) => {
  const { id } = req.params;
  const resolvedId = await resolveUserDocId(id);
  const users = await getUsersList();
  const user = users.find(u => u.uid === resolvedId);
  if (!user) return res.status(404).json({ error: "User not found." });

  // Resolve usernames into basic profiles
  const resolveProfiles = (usernames) => {
    if (!usernames) return [];
    return usernames.map(un => {
      const u = users.find(x => x.username?.toLowerCase() === un.toLowerCase());
      if (u) {
        return { username: u.username, displayName: u.displayName, avatarUrl: u.avatarUrl, preferredColor: u.preferredColor };
      }
      return { username: un, displayName: un, avatarUrl: "preset-1", preferredColor: "#2563eb" };
    });
  };

  res.json({
    friends: resolveProfiles(user.friends),
    requestsIn: resolveProfiles(user.friendRequestsIn),
    requestsOut: resolveProfiles(user.friendRequestsOut)
  });
});

// Send friend request
app.post("/api/friends/:id/request", async (req, res) => {
  const { id } = req.params;
  const { targetUsername } = req.body;
  if (!targetUsername) return res.status(400).json({ error: "Target username required." });

  const resolvedId = await resolveUserDocId(id);
  const users = await getUsersList();
  const user = users.find(u => u.uid === resolvedId);
  if (!user) return res.status(404).json({ error: "User not found." });

  if (user.username?.toLowerCase() === targetUsername.toLowerCase()) {
    return res.status(400).json({ error: "Cannot add yourself." });
  }

  const targetUser = users.find(u => u.username?.toLowerCase() === targetUsername.toLowerCase());
  if (!targetUser) return res.status(404).json({ error: "Target user not found." });

  const myUsername = user.username;
  if (!myUsername) return res.status(400).json({ error: "You must have a username." });

  user.friends = user.friends || [];
  user.friendRequestsOut = user.friendRequestsOut || [];
  targetUser.friends = targetUser.friends || [];
  targetUser.friendRequestsIn = targetUser.friendRequestsIn || [];

  if (user.friends.map(u=>u.toLowerCase()).includes(targetUsername.toLowerCase())) {
    return res.status(400).json({ error: "Already friends." });
  }
  if (user.friendRequestsOut.map(u=>u.toLowerCase()).includes(targetUsername.toLowerCase())) {
    return res.status(400).json({ error: "Request already sent." });
  }
  
  user.friendRequestsOut.push(targetUser.username!);
  targetUser.friendRequestsIn.push(myUsername);

  await saveUserToDb(user);
  await saveUserToDb(targetUser);
  res.json({ success: true });
});

// Accept friend request
app.post("/api/friends/:id/accept", async (req, res) => {
  const { id } = req.params;
  const { targetUsername } = req.body;
  
  const resolvedId = await resolveUserDocId(id);
  const users = await getUsersList();
  const user = users.find(u => u.uid === resolvedId);
  const targetUser = users.find(u => u.username?.toLowerCase() === targetUsername.toLowerCase());
  
  if (!user || !targetUser) return res.status(404).json({ error: "User not found." });

  user.friends = user.friends || [];
  user.friendRequestsIn = user.friendRequestsIn || [];
  targetUser.friends = targetUser.friends || [];
  targetUser.friendRequestsOut = targetUser.friendRequestsOut || [];

  // Remove from requests
  user.friendRequestsIn = user.friendRequestsIn.filter(u => u.toLowerCase() !== targetUsername.toLowerCase());
  targetUser.friendRequestsOut = targetUser.friendRequestsOut.filter(u => u.toLowerCase() !== user.username!.toLowerCase());

  // Add to friends
  if (!user.friends.map(u=>u.toLowerCase()).includes(targetUsername.toLowerCase())) {
    user.friends.push(targetUser.username!);
  }
  if (!targetUser.friends.map(u=>u.toLowerCase()).includes(user.username!.toLowerCase())) {
    targetUser.friends.push(user.username!);
  }

  await saveUserToDb(user);
  await saveUserToDb(targetUser);
  res.json({ success: true });
});

// Decline friend request
app.post("/api/friends/:id/decline", async (req, res) => {
  const { id } = req.params;
  const { targetUsername } = req.body;
  
  const resolvedId = await resolveUserDocId(id);
  const users = await getUsersList();
  const user = users.find(u => u.uid === resolvedId);
  const targetUser = users.find(u => u.username?.toLowerCase() === targetUsername.toLowerCase());
  
  if (!user || !targetUser) return res.status(404).json({ error: "User not found." });

  user.friendRequestsIn = user.friendRequestsIn || [];
  targetUser.friendRequestsOut = targetUser.friendRequestsOut || [];

  user.friendRequestsIn = user.friendRequestsIn.filter(u => u.toLowerCase() !== targetUsername.toLowerCase());
  targetUser.friendRequestsOut = targetUser.friendRequestsOut.filter(u => u.toLowerCase() !== user.username!.toLowerCase());

  await saveUserToDb(user);
  await saveUserToDb(targetUser);
  res.json({ success: true });
});

// Remove friend
app.post("/api/friends/:id/remove", async (req, res) => {
  const { id } = req.params;
  const { targetUsername } = req.body;
  
  const resolvedId = await resolveUserDocId(id);
  const users = await getUsersList();
  const user = users.find(u => u.uid === resolvedId);
  const targetUser = users.find(u => u.username?.toLowerCase() === targetUsername.toLowerCase());
  
  if (!user || !targetUser) return res.status(404).json({ error: "User not found." });

  user.friends = user.friends || [];
  targetUser.friends = targetUser.friends || [];

  user.friends = user.friends.filter(u => u.toLowerCase() !== targetUsername.toLowerCase());
  targetUser.friends = targetUser.friends.filter(u => u.toLowerCase() !== user.username!.toLowerCase());

  await saveUserToDb(user);
  await saveUserToDb(targetUser);
  res.json({ success: true });
});

// Get friend's bag (bypassing privacy if friends)
app.get("/api/friends/:id/bag/:friendUsername", async (req, res) => {
  const { id, friendUsername } = req.params;
  
  const resolvedId = await resolveUserDocId(id);
  const users = await getUsersList();
  const user = users.find(u => u.uid === resolvedId);
  const friend = users.find(u => u.username?.toLowerCase() === friendUsername.toLowerCase());
  
  if (!user || !friend) return res.status(404).json({ error: "User not found." });

  const isFriend = (user.friends || []).map(u => u.toLowerCase()).includes(friendUsername.toLowerCase());
  const isSelf = user.username?.toLowerCase() === friendUsername.toLowerCase();
  
  if (!isFriend && !isSelf) {
    return res.status(403).json({ error: "You are not friends with this user." });
  }

  const balls = await getUserLocker(friend.uid);
  res.json({
    success: true,
    profile: {
      displayName: friend.displayName,
      username: friend.username,
      avatarUrl: friend.avatarUrl,
      preferredColor: friend.preferredColor
    },
    balls
  });
});
`;

if (content.includes('// --- FRIENDS API ---')) {
  console.log('Friends API already injected.');
} else if (content.includes(anchor)) {
  const newContent = content.replace(anchor, anchor + apiCode);
  fs.writeFileSync(serverFile, newContent);
  console.log('Successfully injected Friends API.');
} else {
  console.log('Anchor not found!');
}
