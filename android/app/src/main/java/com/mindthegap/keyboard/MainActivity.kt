package com.mindthegap.keyboard

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.view.inputmethod.InputMethodManager
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mindthegap.keyboard.api.ApiClient
import com.mindthegap.keyboard.api.HealthResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

// Brand Palette matching Chrome Extension
val PitchBlack = Color(0xFF050505)
val DarkGray = Color(0xFF121212)
val CardBg = Color(0xFF1A1A1A)
val NeonYellow = Color(0xFFFFEA00)
val NeonOrange = Color(0xFFFF6A00)
val NeonYellowGlow = Color(0x11FFEA00)
val TextPrimary = Color(0xFFF5F5F5)
val TextSecondary = Color(0xFFB3B3B3)
val TextTertiary = Color(0xFF6B6B6B)
val EmeraldGreen = Color(0xFF10B981)
val CrimsonError = Color(0xFFEF4444)

val NeonGradient = Brush.linearGradient(listOf(NeonYellow, NeonOrange))

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = PitchBlack,
                    surface = DarkGray,
                    primary = NeonYellow,
                    secondary = NeonOrange
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = PitchBlack
                ) {
                    DashboardScreen()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen() {
    val context = LocalContext.current
    var isEnabled by remember { mutableStateOf(false) }
    var isSelected by remember { mutableStateOf(false) }
    
    var serverUrl by remember { mutableStateOf("") }
    var connectionStatus by remember { mutableStateOf("Not Tested") }
    var isTestingConnection by remember { mutableStateOf(false) }
    
    // Periodically update active state indicators
    LaunchedEffect(Unit) {
        while (true) {
            isEnabled = checkKeyboardEnabled(context)
            isSelected = checkKeyboardSelected(context)
            serverUrl = ApiClient.getServerUrl(context)
            kotlinx.coroutines.delay(1000)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PitchBlack)
            .padding(20.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(30.dp))
        
        // Premium Speech Bubble Logo Emblem
        Box(
            modifier = Modifier
                .size(72.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(NeonGradient)
                .padding(2.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(18.dp))
                    .background(Color.Black),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "💬",
                    fontSize = 36.sp,
                    textAlign = TextAlign.Center
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Application Title & Subtitle
        Text(
            text = "Mind The Gap",
            color = TextPrimary,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.SansSerif
        )
        Text(
            text = "AI Social Decoding Keyboard",
            color = NeonYellow,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium,
            letterSpacing = 1.sp
        )

        Spacer(modifier = Modifier.height(28.dp))

        // Setup Progress Wizard Section
        Text(
            text = "SETUP INSTRUCTIONS",
            color = TextTertiary,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Start
        )
        Spacer(modifier = Modifier.height(8.dp))

        // Step 1: Enable Keyboard
        SetupStepCard(
            stepNumber = "1",
            title = "Enable Keyboard",
            description = "Activate Mind The Gap in your Android Language & Input settings.",
            isCompleted = isEnabled,
            actionLabel = "Enable in Settings",
            onClick = {
                val intent = Intent(Settings.ACTION_INPUT_METHOD_SETTINGS)
                context.startActivity(intent)
            }
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Step 2: Select Keyboard
        SetupStepCard(
            stepNumber = "2",
            title = "Select Keyboard",
            description = "Switch your active on-screen keyboard to Mind The Gap.",
            isCompleted = isSelected,
            actionLabel = "Switch Input Method",
            onClick = {
                val imm = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                imm.showInputMethodPicker()
            }
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Backend Server Configuration Section
        Text(
            text = "SECURE GATEWAY CONFIGURATION",
            color = TextTertiary,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Start
        )
        Spacer(modifier = Modifier.height(8.dp))

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(CardBg)
                .border(1.dp, Color(0xFF222222), RoundedCornerShape(12.dp))
                .padding(14.dp)
        ) {
            Text(
                text = "Dynamic API URL",
                color = TextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Configure your self-hosted Railway or Render backend gateway endpoint. Keep API keys secure and dynamic.",
                color = TextTertiary,
                fontSize = 11.sp,
                modifier = Modifier.padding(vertical = 4.dp)
            )

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = serverUrl,
                onValueChange = {
                    serverUrl = it
                    ApiClient.setServerUrl(context, it)
                },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("e.g. http://10.0.2.2:3000", color = TextTertiary, fontSize = 13.sp) },
                colors = TextFieldDefaults.outlinedTextFieldColors(
                    textColor = TextPrimary,
                    focusedBorderColor = NeonYellow,
                    unfocusedBorderColor = Color(0xFF333333),
                    cursorColor = NeonYellow
                ),
                textStyle = LocalTextStyle.current.copy(fontSize = 13.sp, fontFamily = FontFamily.Monospace),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Test Connection Button & Status indicator
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Connection Status Badge
                Row(verticalAlignment = Alignment.CenterVertically) {
                    val badgeColor = when {
                        connectionStatus == "Healthy" -> EmeraldGreen
                        connectionStatus == "Offline" || connectionStatus.startsWith("Error") -> CrimsonError
                        else -> TextTertiary
                    }
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(badgeColor)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = connectionStatus,
                        color = badgeColor,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Button(
                    onClick = {
                        isTestingConnection = true
                        connectionStatus = "Testing..."
                        testBackendConnection(context) { success, msg ->
                            isTestingConnection = false
                            connectionStatus = if (success) "Healthy" else "Offline"
                            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                        }
                    },
                    enabled = !isTestingConnection && serverUrl.isNotEmpty(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = NeonYellow,
                        disabledContainerColor = Color(0xFF222222)
                    ),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                    modifier = Modifier.height(34.dp)
                ) {
                    if (isTestingConnection) {
                        CircularProgressIndicator(
                            color = Color.Black,
                            modifier = Modifier.size(16.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(
                            text = "Test Connection",
                            color = Color.Black,
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(40.dp))
        
        // Developer / Academic Footer
        Text(
            text = "Designed for overthinkers.",
            color = TextTertiary,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium
        )
        Text(
            text = "Mind The Gap © 2026. All rights reserved.",
            color = Color(0xFF333333),
            fontSize = 9.sp,
            modifier = Modifier.padding(top = 4.dp)
        )
        Spacer(modifier = Modifier.height(20.dp))
    }
}

@Composable
fun SetupStepCard(
    stepNumber: String,
    title: String,
    description: String,
    isCompleted: Boolean,
    actionLabel: String,
    onClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(CardBg)
            .border(
                1.dp,
                if (isCompleted) EmeraldGreen.copy(alpha = 0.4f) else Color(0xFF222222),
                RoundedCornerShape(12.dp)
            )
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Step Number Badge
            Box(
                modifier = Modifier
                    .size(24.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(if (isCompleted) EmeraldGreen else NeonOrange),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (isCompleted) "✓" else stepNumber,
                    color = if (isCompleted) Color.Black else Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.width(10.dp))

            // Step Name
            Text(
                text = title,
                color = TextPrimary,
                fontSize = 14.5.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = description,
            color = TextSecondary,
            fontSize = 12.sp,
            lineHeight = 16.sp
        )

        Spacer(modifier = Modifier.height(12.dp))

        if (!isCompleted) {
            Button(
                onClick = onClick,
                modifier = Modifier.fillMaxWidth().height(36.dp),
                colors = ButtonDefaults.buttonColors(containerColor = DarkGray),
                shape = RoundedCornerShape(8.dp),
                border = ButtonDefaults.outlinedButtonBorder.copy(
                    brush = SolidColor(NeonYellow),
                    width = 1.dp
                ),
                contentPadding = PaddingValues(0.dp)
            ) {
                Text(
                    text = actionLabel,
                    color = NeonYellow,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        } else {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFF0F2615))
                    .padding(vertical = 8.dp, horizontal = 10.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Active & Configured",
                    color = EmeraldGreen,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

// Helpers
private fun checkKeyboardEnabled(context: Context): Boolean {
    val imm = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
    val list = imm.enabledInputMethodList
    for (info in list) {
        if (info.packageName == context.packageName) {
            return true
        }
    }
    return false
}

private fun checkKeyboardSelected(context: Context): Boolean {
    val currentIME = Settings.Secure.getString(
        context.contentResolver,
        Settings.Secure.DEFAULT_INPUT_METHOD
    )
    return currentIME != null && currentIME.contains(context.packageName)
}

private fun testBackendConnection(
    context: Context,
    onResult: (Boolean, String) -> Unit
) {
    try {
        val service = ApiClient.getService(context)
        service.checkHealth().enqueue(object : Callback<HealthResponse> {
            override fun onResponse(call: Call<HealthResponse>, response: Response<HealthResponse>) {
                if (response.isSuccessful && response.body()?.status == "healthy") {
                    onResult(true, "Gateway Operational! Status is healthy.")
                } else {
                    onResult(false, "Server responded with error status: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<HealthResponse>, t: Throwable) {
                onResult(false, "Failed to connect: ${t.message}")
            }
        })
    } catch (e: Exception) {
        onResult(false, "Configuration Error: ${e.message}")
    }
}
