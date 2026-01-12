// Script to check household data in Firestore
// Run with: node scripts/check-households.js
// Requires: npm install firebase

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCTJOF9xUSSPBa1SOB9UY87iU0eyEasVho",
  authDomain: "dave-ramsey-budget-project.firebaseapp.com",
  projectId: "dave-ramsey-budget-project",
  storageBucket: "dave-ramsey-budget-project.firebasestorage.app",
  messagingSenderId: "125752059516",
  appId: "1:125752059516:web:7df831fe080751044a4bf9",
  measurementId: "G-TCCXPZLKT8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getUserByEmail(email) {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email.toLowerCase())
    );
    const snapshot = await getDocs(usersQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const userDoc = snapshot.docs[0];
    const data = userDoc.data();
    return {
      id: userDoc.id,
      email: data.email,
      name: data.name || 'Unknown',
      household_ids: data.household_ids || [],
      default_household_id: data.default_household_id,
    };
  } catch (error) {
    console.error(`Error getting user ${email}:`, error);
    return null;
  }
}

async function getEmailForUserId(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return 'Unknown';
    }
    return userDoc.data().email || 'Unknown';
  } catch (error) {
    console.error(`Error getting email for user ${userId}:`, error);
    return 'Unknown';
  }
}

async function checkHouseholds() {
  console.log('🔍 Checking household data in Firestore...\n');

  // Get users
  const henzard = await getUserByEmail('henzardkruger@gmail.com');
  const alicia = await getUserByEmail('aliciakruger87@gmail.com');

  console.log('👤 Users:');
  if (henzard) {
    console.log(`  ✅ henzardkruger@gmail.com: ${henzard.id}`);
    console.log(`     Name: ${henzard.name}`);
    console.log(`     Household IDs in user doc: ${henzard.household_ids.length} - [${henzard.household_ids.join(', ')}]`);
    console.log(`     Default household: ${henzard.default_household_id || 'None'}`);
  } else {
    console.log('  ❌ henzardkruger@gmail.com: NOT FOUND');
  }

  if (alicia) {
    console.log(`  ✅ aliciakruger87@gmail.com: ${alicia.id}`);
    console.log(`     Name: ${alicia.name}`);
    console.log(`     Household IDs in user doc: ${alicia.household_ids.length} - [${alicia.household_ids.join(', ')}]`);
    console.log(`     Default household: ${alicia.default_household_id || 'None'}`);
  } else {
    console.log('  ❌ aliciakruger87@gmail.com: NOT FOUND');
  }

  console.log('\n🏠 Households:');

  // Get all households
  const householdsSnapshot = await getDocs(collection(db, 'households'));
  const households = [];

  for (const householdDoc of householdsSnapshot.docs) {
    const data = householdDoc.data();
    const memberIds = data.member_ids || [];
    
    // Get emails for all members
    const memberEmails = await Promise.all(
      memberIds.map((memberId) => getEmailForUserId(memberId))
    );

    households.push({
      id: householdDoc.id,
      name: data.name || 'Unnamed',
      owner_id: data.owner_id || 'Unknown',
      member_ids: memberIds,
      member_emails: memberEmails,
    });
  }

  // Sort by name
  households.sort((a, b) => a.name.localeCompare(b.name));

  for (const household of households) {
    console.log(`\n  📋 ${household.name} (${household.id})`);
    console.log(`     Owner: ${household.owner_id}`);
    console.log(`     Members (${household.member_ids.length}):`);
    for (let i = 0; i < household.member_ids.length; i++) {
      const memberId = household.member_ids[i];
      const email = household.member_emails[i];
      const isOwner = memberId === household.owner_id;
      console.log(`       ${isOwner ? '👑' : '  '} ${email} (${memberId})`);
    }
  }

  // Verify expected state
  console.log('\n✅ Verification:');
  
  const krugerHousehold = households.find(h => h.name.toLowerCase().includes('kruger'));
  const hetzelHousehold = households.find(h => h.name.toLowerCase().includes('hetzel'));

  if (!krugerHousehold) {
    console.log('  ❌ Kruger household NOT FOUND');
  } else {
    const hasHenzard = henzard && krugerHousehold.member_ids.includes(henzard.id);
    const hasAlicia = alicia && krugerHousehold.member_ids.includes(alicia.id);
    console.log(`  ${hasHenzard ? '✅' : '❌'} Kruger has henzardkruger@gmail.com`);
    console.log(`  ${hasAlicia ? '✅' : '❌'} Kruger has aliciakruger87@gmail.com`);
  }

  if (!hetzelHousehold) {
    console.log('  ❌ Hetzel household NOT FOUND');
  } else {
    const hasHenzard = henzard && hetzelHousehold.member_ids.includes(henzard.id);
    const hasAlicia = alicia && hetzelHousehold.member_ids.includes(alicia.id);
    console.log(`  ${hasHenzard ? '✅' : '❌'} Hetzel has henzardkruger@gmail.com`);
    console.log(`  ${hasAlicia ? '❌' : '✅'} Hetzel does NOT have aliciakruger87@gmail.com (correct)`);
  }

  // Check user.household_ids sync
  console.log('\n🔄 User-Household Sync Check:');
  
  if (henzard) {
    const expectedHouseholdIds = households
      .filter(h => h.member_ids.includes(henzard.id))
      .map(h => h.id);
    const isSynced = expectedHouseholdIds.length === henzard.household_ids.length &&
      expectedHouseholdIds.every(id => henzard.household_ids.includes(id));
    
    console.log(`  henzardkruger@gmail.com:`);
    console.log(`    Expected household_ids: [${expectedHouseholdIds.join(', ')}]`);
    console.log(`    Actual household_ids: [${henzard.household_ids.join(', ')}]`);
    console.log(`    ${isSynced ? '✅' : '⚠️'} User doc is ${isSynced ? 'synced' : 'OUT OF SYNC'}`);
  }

  if (alicia) {
    const expectedHouseholdIds = households
      .filter(h => h.member_ids.includes(alicia.id))
      .map(h => h.id);
    const isSynced = expectedHouseholdIds.length === alicia.household_ids.length &&
      expectedHouseholdIds.every(id => alicia.household_ids.includes(id));
    
    console.log(`  aliciakruger87@gmail.com:`);
    console.log(`    Expected household_ids: [${expectedHouseholdIds.join(', ')}]`);
    console.log(`    Actual household_ids: [${alicia.household_ids.join(', ')}]`);
    console.log(`    ${isSynced ? '✅' : '⚠️'} User doc is ${isSynced ? 'synced' : 'OUT OF SYNC'}`);
  }

  console.log('\n✨ Check complete!');
}

// Run the check
checkHouseholds()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
