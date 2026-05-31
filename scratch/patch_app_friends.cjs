const fs = require('fs');
const path = require('path');

const appFile = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(appFile, 'utf8');

// 1. Imports
if (!content.includes('import FriendsPortal')) {
  content = content.replace(
    /import XlsImporter from "\.\/components\/XlsImporter";/,
    `import XlsImporter from "./components/XlsImporter";\nimport FriendsPortal from "./components/FriendsPortal";`
  );
}

// 2. States
if (!content.includes('isFriendsPortalOpen')) {
  content = content.replace(
    /const \[isUserManagerOpen, setIsUserManagerOpen\] = useState\(false\);/,
    `const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);\n  const [isFriendsPortalOpen, setIsFriendsPortalOpen] = useState(false);\n  const [friendBagUsername, setFriendBagUsername] = useState<string | null>(null);`
  );
}

// 3. Effect for friendBagUsername
const friendBagEffect = `
  // Load friend bag data
  useEffect(() => {
    if (friendBagUsername && userProfile) {
      setIsSharedViewLoading(true);
      setSharedLockerError(null);
      setSharedLockerOwner(null);
      setSharedLockerBalls([]);
      fetch(\`/api/friends/\${userProfile.uid}/bag/\${encodeURIComponent(friendBagUsername)}\`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSharedLockerOwner(data.profile);
            setSharedLockerBalls(data.balls);
          } else {
            setSharedLockerError(data.error || "Could not load friend's bag.");
          }
        })
        .catch(err => {
          console.error(err);
          setSharedLockerError("Failed to connect to server.");
        })
        .finally(() => {
          setIsSharedViewLoading(false);
        });
    }
  }, [friendBagUsername, userProfile]);
`;
if (!content.includes('friendBagUsername && userProfile')) {
  content = content.replace(
    /\/\/ Fetch initial catalog/,
    friendBagEffect + '\n  // Fetch initial catalog'
  );
}

// 4. Dropdown item
const friendsBtn = `
                      {/* Friends Portal */}
                      <button
                        onClick={() => {
                          setIsFriendsPortalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer border border-transparent font-bold"
                      >
                        <Users size={12} className="text-neutral-500" />
                        <span>Friends</span>
                      </button>
                      <div className="border-b border-neutral-900 my-1"></div>
`;
if (!content.includes('setIsFriendsPortalOpen(true)')) {
  content = content.replace(
    /\{\/\* Theme selection row \*\/\}/,
    friendsBtn + '\n                      {/* Theme selection row */}'
  );
}

// 5. Render FriendsPortal Component
const friendsPortalComponent = `
      {isFriendsPortalOpen && userProfile && (
        <FriendsPortal
          currentUserUid={userProfile.uid}
          onClose={() => setIsFriendsPortalOpen(false)}
          onViewBag={(username) => {
            setFriendBagUsername(username);
          }}
        />
      )}
`;
if (!content.includes('<FriendsPortal')) {
  content = content.replace(
    /\{isUserManagerOpen && \(/,
    friendsPortalComponent + '\n      {isUserManagerOpen && ('
  );
}

// 6. Update isSharedView definition
if (content.includes('const isSharedView = !!shareUsername;')) {
  content = content.replace(
    /const isSharedView = !!shareUsername;/,
    `const isSharedView = !!shareUsername || !!friendBagUsername;`
  );
}

// 7. Update public share view rendering logic
if (content.includes('Public Share View')) {
  content = content.replace(
    /Public Share View/,
    `{friendBagUsername ? "Friend's Bag" : "Public Share View"}`
  );
}

// 8. Add close button or back button to friend's bag view
if (content.includes('sharedLockerBalls.reduce')) {
  // we want to add a close button if friendBagUsername is active
  const closeFriendBagBtn = `
              {friendBagUsername && (
                <button
                  onClick={() => {
                    setFriendBagUsername(null);
                    setSharedLockerOwner(null);
                    setSharedLockerBalls([]);
                  }}
                  className="mt-4 w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg transition-colors border border-neutral-800 cursor-pointer flex items-center justify-center gap-2"
                >
                  <X size={16} /> Return to My Vault
                </button>
              )}
`;
  if (!content.includes('Return to My Vault')) {
    content = content.replace(
      /<div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between text-white">/,
      closeFriendBagBtn + '\n              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between text-white">'
    );
  }
}

fs.writeFileSync(appFile, content);
console.log("App.tsx patched successfully.");
