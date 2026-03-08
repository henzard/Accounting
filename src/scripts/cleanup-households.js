// Script to clean up duplicate households
// Run with: cd src && node scripts/cleanup-households.js
// This will keep only 2 households: "Kruger Family" and "Hetzel Family"

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, updateDoc, arrayRemove } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCTJOF9xUSSPBa1SOB9UY87iU0eyEasVho",
  authDomain: "dave-ramsey-budget-project.firebaseapp.com",
  projectId: "dave-ramsey-budget-project",
  storageBucket: "dave-ramsey-budget-project.firebasestorage.app",
  messagingSenderId: "125752059516",
  appId: "1:125752059516:web:7df831fe080751044a4bf9",
  measurementId: "G-TCCXPZLKT8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getUserByEmail(email) {
  const { query, where, getDocs } = require('firebase/firestore');
  const usersQuery = query(
    collection(db, 'users'),
    where('email', '==', email.toLowerCase())
  );
  const snapshot = await getDocs(usersQuery);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

async function cleanupHouseholds() {
  console.log('🧹 Starting household cleanup...\n');

  // Get users
  const henzard = await getUserByEmail('henzardkruger@gmail.com');
  const alicia = await getUserByEmail('aliciakruger87@gmail.com');

  if (!henzard || !alicia) {
    console.error('❌ Could not find both users');
    return;
  }

  console.log(`✅ Found users:`);
  console.log(`   henzardkruger@gmail.com: ${henzard.id}`);
  console.log(`   aliciakruger87@gmail.com: ${alicia.id}\n`);

  // Get all households
  const householdsSnapshot = await getDocs(collection(db, 'households'));
  const households = householdsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  console.log(`📋 Found ${households.length} households\n`);

  // Find the correct households to keep
  // 1. "Kruger Family" with both members (should be 0adbbf62-afe8-474d-b4c0-6bfef4215d8b)
  // 2. "Hetzel Family" with only henzard
  
  const krugerHousehold = households.find(h => 
    h.name.toLowerCase().includes('kruger') && 
    h.member_ids && 
    h.member_ids.includes(henzard.id) && 
    h.member_ids.includes(alicia.id)
  );

  const hetzelHousehold = households.find(h => 
    h.name.toLowerCase().includes('hetzel') && 
    h.member_ids && 
    h.member_ids.includes(henzard.id) &&
    (!h.member_ids.includes(alicia.id))
  );

  if (!krugerHousehold) {
    console.error('❌ Could not find Kruger household with both members');
    return;
  }

  if (!hetzelHousehold) {
    console.error('❌ Could not find Hetzel household');
    return;
  }

  console.log(`✅ Households to keep:`);
  console.log(`   Kruger Family: ${krugerHousehold.id} (${krugerHousehold.member_ids.length} members)`);
  console.log(`   Hetzel Family: ${hetzelHousehold.id} (${hetzelHousehold.member_ids.length} members)\n`);

  // Ensure Hetzel only has henzard
  if (hetzelHousehold.member_ids.includes(alicia.id)) {
    console.log(`⚠️  Removing alicia from Hetzel household...`);
    await updateDoc(doc(db, 'households', hetzelHousehold.id), {
      member_ids: hetzelHousehold.member_ids.filter(id => id !== alicia.id)
    });
    console.log(`✅ Removed alicia from Hetzel household\n`);
  }

  // Ensure Kruger has both members
  if (!krugerHousehold.member_ids.includes(henzard.id) || !krugerHousehold.member_ids.includes(alicia.id)) {
    console.log(`⚠️  Adding missing members to Kruger household...`);
    const updatedMemberIds = [...new Set([
      ...krugerHousehold.member_ids,
      henzard.id,
      alicia.id
    ])];
    await updateDoc(doc(db, 'households', krugerHousehold.id), {
      member_ids: updatedMemberIds
    });
    console.log(`✅ Updated Kruger household members\n`);
  }

  // Delete all other households
  const householdsToDelete = households.filter(h => 
    h.id !== krugerHousehold.id && h.id !== hetzelHousehold.id
  );

  console.log(`🗑️  Deleting ${householdsToDelete.length} duplicate households...\n`);

  for (const household of householdsToDelete) {
    console.log(`   Deleting: ${household.name} (${household.id})`);
    
    // Remove household from all users' household_ids
    for (const memberId of (household.member_ids || [])) {
      try {
        const userDoc = await getDoc(doc(db, 'users', memberId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedHouseholdIds = (userData.household_ids || []).filter(id => id !== household.id);
          await updateDoc(doc(db, 'users', memberId), {
            household_ids: updatedHouseholdIds,
            // If this was the default, set to Kruger
            default_household_id: userData.default_household_id === household.id 
              ? krugerHousehold.id 
              : userData.default_household_id
          });
        }
      } catch (error) {
        console.error(`   ⚠️  Error updating user ${memberId}:`, error.message);
      }
    }
    
    // Delete the household
    try {
      await deleteDoc(doc(db, 'households', household.id));
      console.log(`   ✅ Deleted: ${household.name}`);
    } catch (error) {
      console.error(`   ❌ Error deleting ${household.name}:`, error.message);
    }
  }

  // Update user household_ids to only include the two kept households
  console.log(`\n🔄 Updating user household_ids...`);
  
  // Update henzard
  await updateDoc(doc(db, 'users', henzard.id), {
    household_ids: [krugerHousehold.id, hetzelHousehold.id],
    default_household_id: henzard.default_household_id === krugerHousehold.id 
      ? krugerHousehold.id 
      : (henzard.default_household_id === hetzelHousehold.id 
        ? hetzelHousehold.id 
        : krugerHousehold.id) // Default to Kruger if current default is being deleted
  });
  console.log(`   ✅ Updated henzardkruger@gmail.com`);

  // Update alicia
  await updateDoc(doc(db, 'users', alicia.id), {
    household_ids: [krugerHousehold.id],
    default_household_id: alicia.default_household_id === krugerHousehold.id 
      ? krugerHousehold.id 
      : krugerHousehold.id // Always Kruger for alicia
  });
  console.log(`   ✅ Updated aliciakruger87@gmail.com`);

  console.log(`\n✨ Cleanup complete!`);
  console.log(`\n📊 Final state:`);
  console.log(`   - Kruger Family (${krugerHousehold.id}): henzardkruger@gmail.com, aliciakruger87@gmail.com`);
  console.log(`   - Hetzel Family (${hetzelHousehold.id}): henzardkruger@gmail.com`);
}

cleanupHouseholds()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
