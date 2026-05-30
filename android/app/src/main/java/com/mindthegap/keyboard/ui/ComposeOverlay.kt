package com.mindthegap.keyboard.ui

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mindthegap.keyboard.api.*

// Color Palette matching the extension theme
val PitchBlack = Color(0xFF050505)
val DarkGray = Color(0xFF121212)
val CardBg = Color(0xFF1A1A1A)
val NeonYellow = Color(0xFFFFEA00)
val NeonOrange = Color(0xFFFF6A00)
val NeonYellowGlow = Color(0x22FFEA00)
val TextPrimary = Color(0xFFF5F5F5)
val TextSecondary = Color(0xFFB3B3B3)
val TextTertiary = Color(0xFF6B6B6B)
val EmeraldGreen = Color(0xFF10B981)
val AmberWarning = Color(0xFFF59E0B)
val CrimsonError = Color(0xFFEF4444)

val NeonGradient = Brush.linearGradient(listOf(NeonYellow, NeonOrange))

@Composable
fun MindTheGapKeyboardUI(
    clipboardText: String,
    onClipboardAction: (String) -> Unit,
    onKeyClick: (String) -> Unit,
    onBackspace: () -> Unit,
    onSpace: () -> Unit,
    onEnter: () -> Unit,
    onSwitchKeyboard: () -> Unit,
    pendingRetrospective: String?, // Message text awaiting retrospective feedback
    onFeedbackSubmit: (String) -> Unit, // rating feedback submit
    onFeedbackDismiss: () -> Unit,
    isAnalyzing: Boolean,
    analysisResponse: AnalyzeResponse?,
    onAnalyzeClick: (String) -> Unit,
    onClearAnalysis: () -> Unit,
    activeTab: String,
    onTabChange: (String) -> Unit,
    openerResult: OpenerResponse?,
    onGenerateOpener: (String) -> Unit,
    onClearOpener: () -> Unit,
    isGeneratingOpener: Boolean
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(PitchBlack)
            .border(1.dp, Color(0xFF222222), RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
            .padding(bottom = 6.dp)
    ) {
        // AI Overlay / Workspace Card
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 10.dp, vertical = 6.dp)
        ) {
            // Retrospective Feedback Banner (if available)
            if (pendingRetrospective != null) {
                RetrospectiveFeedbackBanner(
                    message = pendingRetrospective,
                    onSubmitFeedback = onFeedbackSubmit,
                    onDismiss = onFeedbackDismiss
                )
                Spacer(modifier = Modifier.height(6.dp))
            }

            // Clipboard Detection Row
            if (clipboardText.isNotEmpty() && analysisResponse == null && openerResult == null && !isAnalyzing && !isGeneratingOpener) {
                ClipboardDetectionRow(
                    text = clipboardText,
                    onAnalyze = { onClipboardAction(clipboardText) }
                )
                Spacer(modifier = Modifier.height(6.dp))
            }

            // Tabs / Active Operations
            TabRowSection(activeTab = activeTab, onTabChange = onTabChange)
            Spacer(modifier = Modifier.height(6.dp))

            // Tab Views
            Box(modifier = Modifier.heightIn(max = 220.dp)) {
                when (activeTab) {
                    "analyze" -> MessageAnalyzerView(
                        isAnalyzing = isAnalyzing,
                        analysisResponse = analysisResponse,
                        onAnalyze = onAnalyzeClick,
                        onClear = onClearAnalysis,
                        clipboardText = clipboardText
                    )
                    "openers" -> OneLinersView(
                        isGenerating = isGeneratingOpener,
                        openerResult = openerResult,
                        onGenerate = onGenerateOpener,
                        onClear = onClearOpener,
                        clipboardText = clipboardText
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(4.dp))
        Divider(color = Color(0xFF222222), thickness = 1.dp)
        Spacer(modifier = Modifier.height(4.dp))

        // Virtual Keyboard Keys Grid
        ComposeQWERTYKeyboard(
            onKeyClick = onKeyClick,
            onBackspace = onBackspace,
            onSpace = onSpace,
            onEnter = onEnter,
            onSwitchKeyboard = onSwitchKeyboard
        )
    }
}

// ---- Composable: Retrospective Feedback Card ----
@Composable
fun RetrospectiveFeedbackBanner(
    message: String,
    onSubmitFeedback: (String) -> Unit,
    onDismiss: () -> Unit
) {
    var isSubmitted by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(DarkGray)
            .border(1.dp, NeonYellowGlow, RoundedCornerShape(12.dp))
            .padding(10.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "💡 Hindsight Accuracy Check",
                color = NeonYellow,
                fontSize = 11.5.sp,
                fontWeight = FontWeight.Bold
            )
            IconButton(
                onClick = onDismiss,
                modifier = Modifier.size(18.dp)
            ) {
                Text("✕", color = TextTertiary, fontSize = 11.sp)
            }
        }
        
        Spacer(modifier = Modifier.height(4.dp))

        if (!isSubmitted) {
            Text(
                text = "Looking back, was our subtext analysis of this message accurate?",
                color = TextSecondary,
                fontSize = 11.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "\"$message\"",
                color = TextTertiary,
                fontSize = 10.5.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                fontFamily = FontFamily.Monospace,
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.Black)
                    .padding(4.dp)
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Button(
                    onClick = {
                        onSubmitFeedback("accurate")
                        isSubmitted = true
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen),
                    shape = RoundedCornerShape(6.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    modifier = Modifier.weight(1f).height(28.dp)
                ) {
                    Text("✅ Yes", color = Color.Black, fontSize = 10.5.sp, fontWeight = FontWeight.Bold)
                }
                Button(
                    onClick = {
                        onSubmitFeedback("partial")
                        isSubmitted = true
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AmberWarning),
                    shape = RoundedCornerShape(6.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    modifier = Modifier.weight(1f).height(28.dp)
                ) {
                    Text("⚠️ Partly", color = Color.Black, fontSize = 10.5.sp, fontWeight = FontWeight.Bold)
                }
                Button(
                    onClick = {
                        onSubmitFeedback("wrong")
                        isSubmitted = true
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = CrimsonError),
                    shape = RoundedCornerShape(6.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    modifier = Modifier.weight(1f).height(28.dp)
                ) {
                    Text("❌ No", color = Color.White, fontSize = 10.5.sp, fontWeight = FontWeight.Bold)
                }
            }
        } else {
            Text(
                text = "Thank you for the feedback! 🙏 We will use this to improve our custom model.",
                color = EmeraldGreen,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

// ---- Composable: Clipboard Prompt Row ----
@Composable
fun ClipboardDetectionRow(
    text: String,
    onAnalyze: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(DarkGray)
            .border(1.dp, Color(0xFF222222), RoundedCornerShape(8.dp))
            .clickable { onAnalyze() }
            .padding(horizontal = 10.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.weight(1f)
        ) {
            Text("📋", fontSize = 14.sp)
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "Analyze: \"$text\"",
                color = TextSecondary,
                fontSize = 11.5.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
        Text(
            text = "Analyze ✨",
            color = NeonYellow,
            fontSize = 11.5.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

// ---- Composable: Sliding Tabs Navigation ----
@Composable
fun TabRowSection(
    activeTab: String,
    onTabChange: (String) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(DarkGray)
            .padding(2.dp)
    ) {
        val tabs = listOf("analyze" to "🔍 Message Analyzer", "openers" to "⚡ One-Liners")
        tabs.forEach { (key, label) ->
            val isActive = activeTab == key
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(if (isActive) NeonYellow else Color.Transparent)
                    .clickable { onTabChange(key) }
                    .padding(vertical = 6.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = label,
                    color = if (isActive) Color.Black else TextSecondary,
                    fontSize = 12.sp,
                    fontWeight = if (isActive) FontWeight.Bold else FontWeight.Medium
                )
            }
        }
    }
}

// ---- Composable: Message Analyzer Tab ----
@Composable
fun MessageAnalyzerView(
    isAnalyzing: Boolean,
    analysisResponse: AnalyzeResponse?,
    onAnalyze: (String) -> Unit,
    onClear: () -> Unit,
    clipboardText: String
) {
    if (isAnalyzing) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            CircularProgressIndicator(color = NeonYellow, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text("Decoding subtext...", color = TextSecondary, fontSize = 12.sp)
        }
    } else if (analysisResponse == null) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Copy a message from any chat app and tap the clipboard shortcut above, or enter text to begin analysis.",
                color = TextTertiary,
                fontSize = 11.5.sp,
                textAlign = TextAlign.Center
            )
            if (clipboardText.isEmpty()) {
                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = { onAnalyze("Whenever you want od you have some do places in mind ?") },
                    colors = ButtonDefaults.buttonColors(containerColor = CardBg),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text("Try Demo Analysis 🔮", color = TextPrimary, fontSize = 11.sp)
                }
            }
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Analysis Results", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text(
                        text = "✕ Clear",
                        color = CrimsonError,
                        fontSize = 11.sp,
                        modifier = Modifier.clickable { onClear() }
                    )
                }
            }

            // Interpretations Section
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(CardBg)
                        .padding(10.dp)
                ) {
                    Text("🔍 What they likely mean:", color = TextSecondary, fontWeight = FontWeight.SemiBold, fontSize = 11.5.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    analysisResponse.interpretations.forEach { interp ->
                        Row(
                            verticalAlignment = Alignment.Top,
                            modifier = Modifier.padding(vertical = 2.dp)
                        ) {
                            val dotColor = when (interp.confidence) {
                                "high" -> EmeraldGreen
                                "medium" -> AmberWarning
                                else -> CrimsonError
                            }
                            Box(
                                modifier = Modifier
                                    .padding(top = 4.dp, end = 6.dp)
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(dotColor)
                            )
                            Column {
                                Text(interp.text, color = TextPrimary, fontSize = 12.sp)
                                Text("${interp.confidence} confidence", color = TextTertiary, fontSize = 9.5.sp)
                            }
                        }
                    }
                }
            }

            // Tone Section
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(CardBg)
                        .padding(10.dp)
                ) {
                    Text("🎭 Tone: ${analysisResponse.tone.label}", color = TextSecondary, fontWeight = FontWeight.SemiBold, fontSize = 11.5.sp)
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(analysisResponse.tone.explanation, color = TextPrimary, fontSize = 12.sp)
                    
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("❄️", fontSize = 11.sp)
                        Spacer(modifier = Modifier.width(4.dp))
                        // Progress bar for warmth scale
                        LinearProgressIndicator(
                            progress = analysisResponse.tone.warmth / 100f,
                            color = NeonOrange,
                            trackColor = Color(0xFF333333),
                            modifier = Modifier
                                .weight(1f)
                                .height(5.dp)
                                .clip(CircleShape)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("🔥", fontSize = 11.sp)
                    }
                }
            }

            // Replies Section
            if (analysisResponse.replies.isNotEmpty()) {
                item {
                    Text("💬 Reply suggestions:", color = TextSecondary, fontWeight = FontWeight.SemiBold, fontSize = 11.5.sp)
                }
                items(analysisResponse.replies) { reply ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(DarkGray)
                            .border(1.dp, Color(0xFF222222), RoundedCornerShape(8.dp))
                            .padding(8.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = reply.intent.toUpperCase(),
                                color = NeonYellow,
                                fontSize = 9.5.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(reply.text, color = TextPrimary, fontSize = 12.5.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(reply.rationale, color = TextTertiary, fontSize = 10.5.sp)
                    }
                }
            }
        }
    }
}

// ---- Composable: One-Liners Tab ----
@Composable
fun OneLinersView(
    isGenerating: Boolean,
    openerResult: OpenerResponse?,
    onGenerate: (String) -> Unit,
    onClear: () -> Unit,
    clipboardText: String
) {
    if (isGenerating) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            CircularProgressIndicator(color = NeonYellow, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text("Drafting openers...", color = TextSecondary, fontSize = 12.sp)
        }
    } else if (openerResult == null) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Tap below to auto-generate customized opening hooks in our demo context.",
                color = TextTertiary,
                fontSize = 11.5.sp,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(10.dp))
            Button(
                onClick = { onGenerate("Met on Hinge. She says she loves hiking and could eat authentic carbonara every day.") },
                colors = ButtonDefaults.buttonColors(containerColor = NeonYellow),
                shape = RoundedCornerShape(6.dp)
            ) {
                Text("Generate Demo One-Liners ⚡", color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Tailored One-Liners", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text(
                        text = "✕ Clear",
                        color = CrimsonError,
                        fontSize = 11.sp,
                        modifier = Modifier.clickable { onClear() }
                    )
                }
            }

            // Safe Opener
            item {
                OpenerCard(riskLabel = "Safe", badgeColor = EmeraldGreen, text = openerResult.safe)
            }

            // Risky Opener
            item {
                OpenerCard(riskLabel = "Little Risky", badgeColor = AmberWarning, text = openerResult.risky)
            }

            // Unhinged Opener
            item {
                OpenerCard(riskLabel = "Unhinged", badgeColor = CrimsonError, text = openerResult.unhinged)
            }
        }
    }
}

@Composable
fun OpenerCard(
    riskLabel: String,
    badgeColor: Color,
    text: String
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(CardBg)
            .padding(10.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(badgeColor.copy(alpha = 0.15f))
                    .border(1.dp, badgeColor.copy(alpha = 0.35f), RoundedCornerShape(4.dp))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(riskLabel.toUpperCase(), color = badgeColor, fontSize = 9.sp, fontWeight = FontWeight.Bold)
            }
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(text, color = TextPrimary, fontSize = 12.5.sp, fontWeight = FontWeight.Medium)
    }
}

// ---- Composable: Virtual Keyboard Grid Layout ----
@Composable
fun ComposeQWERTYKeyboard(
    onKeyClick: (String) -> Unit,
    onBackspace: () -> Unit,
    onSpace: () -> Unit,
    onEnter: () -> Unit,
    onSwitchKeyboard: () -> Unit
) {
    val row1 = listOf("q", "w", "e", "r", "t", "y", "u", "i", "o", "p")
    val row2 = listOf("a", "s", "d", "f", "g", "h", "j", "k", "l")
    val row3 = listOf("z", "x", "c", "v", "b", "n", "m")

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 4.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        // Row 1
        Row(modifier = Modifier.fillMaxWidth()) {
            row1.forEach { char ->
                KeyboardKey(text = char, modifier = Modifier.weight(1f)) { onKeyClick(char) }
            }
        }

        // Row 2 (offset)
        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp)) {
            row2.forEach { char ->
                KeyboardKey(text = char, modifier = Modifier.weight(1f)) { onKeyClick(char) }
            }
        }

        // Row 3 (Shift + Keys + Backspace)
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            KeyboardKey(text = "⬆️", modifier = Modifier.weight(1.5f)) { /* Toggle capitalization */ }
            row3.forEach { char ->
                KeyboardKey(text = char, modifier = Modifier.weight(1f)) { onKeyClick(char) }
            }
            KeyboardKey(text = "⌫", modifier = Modifier.weight(1.5f)) { onBackspace() }
        }

        // Row 4 (Switch + Space + Enter)
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            KeyboardKey(text = "🌐", modifier = Modifier.weight(1.5f)) { onSwitchKeyboard() }
            KeyboardKey(text = ", ", modifier = Modifier.weight(1f)) { onKeyClick(",") }
            KeyboardKey(text = "SPACE", modifier = Modifier.weight(5f)) { onSpace() }
            KeyboardKey(text = ". ", modifier = Modifier.weight(1f)) { onKeyClick(".") }
            KeyboardKey(text = "ENTER", modifier = Modifier.weight(1.5f)) { onEnter() }
        }
    }
}

@Composable
fun KeyboardKey(
    text: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .padding(2.dp)
            .height(44.dp)
            .clip(RoundedCornerShape(6.dp))
            .background(if (text == "SPACE" || text == "ENTER") NeonYellow else Color(0xFF222222))
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            color = if (text == "SPACE" || text == "ENTER") Color.Black else TextPrimary,
            fontSize = if (text == "SPACE" || text == "ENTER") 12.sp else 16.sp,
            fontWeight = if (text == "SPACE" || text == "ENTER") FontWeight.Bold else FontWeight.Medium
        )
    }
}
