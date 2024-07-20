package com.AistearUnicaPartner
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        try {
            // Handle FCM messages here.
            Log.d(TAG, "From: ${remoteMessage.from}")
            // Check if message contains a data payload.
            if (remoteMessage.data.isNotEmpty()) {
                Log.d(TAG, "Message data payload: ${remoteMessage.data}")
                handleDataMessage(remoteMessage.data)
            }
            // Check if message contains a notification payload.
            remoteMessage.notification?.let {
                Log.d(TAG, "Message Notification Body: ${it.body}")
                sendNotification(it.body)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error handling the message: ${e.message}", e)
        }
    }
    override fun onDeletedMessages() {
        try {
            Log.d(TAG, "Deleted messages on server")
        } catch (e: Exception) {
            Log.e(TAG, "Error handling deleted messages: ${e.message}", e)
        }
    }
    private fun handleDataMessage(data: Map<String, String>) {
        try {
            // Handle data message
            // Example: Parse data and show notification or process it
        } catch (e: Exception) {
            Log.e(TAG, "Error handling data message: ${e.message}", e)
        }
    }
    private fun sendNotification(messageBody: String?) {
        try {
            val intent = Intent(this, MainActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            val pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE)
            val channelId = getString(R.string.default_notification_channel_id)
            val notificationBuilder = NotificationCompat.Builder(this, channelId)
                .setSmallIcon(R.drawable.ic_stat_ic_notification)
                .setContentTitle(getString(R.string.fcm_message))
                .setContentText(messageBody)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(channelId, "Channel human readable title", NotificationManager.IMPORTANCE_DEFAULT)
                notificationManager.createNotificationChannel(channel)
            }
            notificationManager.notify(0, notificationBuilder.build())
        } catch (e: Exception) {
            Log.e(TAG, "Error sending notification: ${e.message}", e)
        }
    }
    companion object {
        private const val TAG = "MyFirebaseMsgService"
    }
}