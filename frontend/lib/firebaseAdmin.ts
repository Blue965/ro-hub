import admin from 'firebase-admin'

let firebaseAdminApp: admin.app.App

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!serviceAccountJson) {
    console.warn('FIREBASE_SERVICE_ACCOUNT not provided; admin SDK not initialized')
  } else {
    const serviceAccount = JSON.parse(serviceAccountJson)
    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
    })
  }
}

export const adminAuth = admin.auth()
export const adminDb = admin.firestore()
export const adminStorage = admin.storage().bucket()
