package com.mindthegap.keyboard

import android.content.ClipboardManager
import android.content.Context
import android.inputmethodservice.InputMethodService
import android.os.Build
import android.view.KeyEvent
import android.view.View
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.Toast
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.*
import androidx.compose.ui.platform.ComposeView
import com.mindthegap.keyboard.api.*
import com.mindthegap.keyboard.ui.*
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MindTheGapIME : InputMethodService() {

    private var composeView: ComposeView? = null

    // ---- Reactive Compose State Variables ----
    private var clipboardText by mutableStateOf("")
    private var isAnalyzing by mutableStateOf(false)
    private var analysisResponse by mutableStateOf<AnalyzeResponse?>(null)
    private var isGeneratingOpener by mutableStateOf(false)
    private var openerResult by mutableStateOf<OpenerResponse?>(null)
    private var activeTab by mutableStateOf("analyze")
    private var pendingRetrospective by mutableStateOf<String?>(null)
    
    // Feedback cache
    private var lastAnalyzedMessage by mutableStateOf<String?>(null)
    private var lastAnalysisResponse by mutableStateOf<AnalyzeResponse?>(null)

    override fun onCreateInputView(): View {
        val view = ComposeView(this)
        view.setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = PitchBlack,
                    surface = DarkGray,
                    primary = NeonYellow,
                    secondary = NeonOrange
                )
            ) {
                MindTheGapKeyboardUI(
                    clipboardText = clipboardText,
                    onClipboardAction = { text ->
                        analyzeMessageText(text)
                    },
                    onKeyClick = { char ->
                        val ic = currentInputConnection
                        ic?.commitText(char, 1)
                    },
                    onBackspace = {
                        val ic = currentInputConnection
                        ic?.deleteSurroundingText(1, 0)
                    },
                    onSpace = {
                        val ic = currentInputConnection
                        ic?.commitText(" ", 1)
                    },
                    onEnter = {
                        val ic = currentInputConnection
                        ic?.sendKeyEvent(KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_ENTER))
                        ic?.sendKeyEvent(KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_ENTER))
                    },
                    onSwitchKeyboard = {
                        val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                        try {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                                switchToNextInputMethod(false)
                            } else {
                                imm.switchToNextInputMethod(window.window?.attributes?.token, false)
                            }
                        } catch (e: Exception) {
                            Toast.makeText(this, "Switching keyboard not supported", Toast.LENGTH_SHORT).show()
                        }
                    },
                    pendingRetrospective = pendingRetrospective,
                    onFeedbackSubmit = { rating ->
                        submitRetrospective(rating)
                    },
                    onFeedbackDismiss = {
                        pendingRetrospective = null
                    },
                    isAnalyzing = isAnalyzing,
                    analysisResponse = analysisResponse,
                    onAnalyzeClick = { text ->
                        analyzeMessageText(text)
                    },
                    onClearAnalysis = {
                        // Display retrospective card as soon as they clear their results
                        if (lastAnalyzedMessage != null && lastAnalysisResponse != null) {
                            pendingRetrospective = lastAnalyzedMessage
                        }
                        analysisResponse = null
                    },
                    activeTab = activeTab,
                    onTabChange = { tab ->
                        activeTab = tab
                    },
                    openerResult = openerResult,
                    onGenerateOpener = { contextText ->
                        generateOpeningLines(contextText)
                    },
                    onClearOpener = {
                        openerResult = null
                    },
                    isGeneratingOpener = isGeneratingOpener
                )
            }
        }
        composeView = view
        return view
    }

    override fun onStartInputView(info: EditorInfo?, restarting: Boolean) {
        super.onStartInputView(info, restarting)
        updateClipboardText()
    }

    private fun updateClipboardText() {
        try {
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            if (clipboard.hasPrimaryClip()) {
                val item = clipboard.primaryClip?.getItemAt(0)
                val text = item?.text?.toString() ?: ""
                clipboardText = if (text.trim().isNotEmpty()) text.trim() else ""
            } else {
                clipboardText = ""
            }
        } catch (e: Exception) {
            clipboardText = ""
        }
    }

    // ---- API Communication Pipelines ----

    private fun analyzeMessageText(text: String) {
        if (text.trim().isEmpty()) return

        isAnalyzing = true
        analysisResponse = null

        val service = ApiClient.getService(this)
        val request = AnalyzeRequest(
            message = text,
            mode = "general",
            helpLevel = 3,
            responseStyle = "balanced"
        )

        service.analyzeMessage(request).enqueue(object : Callback<AnalyzeResponse> {
            override fun onResponse(call: Call<AnalyzeResponse>, response: Response<AnalyzeResponse>) {
                isAnalyzing = false
                if (response.isSuccessful && response.body() != null) {
                    analysisResponse = response.body()
                    lastAnalyzedMessage = text
                    lastAnalysisResponse = response.body()
                } else {
                    Toast.makeText(this@MindTheGapIME, "Analysis failed: ${response.code()}", Toast.LENGTH_LONG).show()
                }
            }

            override fun onFailure(call: Call<AnalyzeResponse>, t: Throwable) {
                isAnalyzing = false
                Toast.makeText(this@MindTheGapIME, "API connection error: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun generateOpeningLines(contextText: String) {
        if (contextText.trim().isEmpty()) return

        isGeneratingOpener = true
        openerResult = null

        val service = ApiClient.getService(this)
        val request = OpenerRequest(
            context = contextText,
            mode = "general"
        )

        service.generateOpener(request).enqueue(object : Callback<OpenerResponse> {
            override fun onResponse(call: Call<OpenerResponse>, response: Response<OpenerResponse>) {
                isGeneratingOpener = false
                if (response.isSuccessful && response.body() != null) {
                    openerResult = response.body()
                } else {
                    Toast.makeText(this@MindTheGapIME, "Opener generation failed: ${response.code()}", Toast.LENGTH_LONG).show()
                }
            }

            override fun onFailure(call: Call<OpenerResponse>, t: Throwable) {
                isGeneratingOpener = false
                Toast.makeText(this@MindTheGapIME, "API connection error: ${t.message}", Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun submitRetrospective(rating: String) {
        val messageText = lastAnalyzedMessage ?: return
        val analysis = lastAnalysisResponse ?: return

        val service = ApiClient.getService(this)
        val request = FeedbackRequest(
            analysisId = "analysis_" + System.currentTimeMillis(),
            platform = "android_keyboard",
            rating = rating,
            message = messageText,
            aiAnalysis = analysis
        )

        service.submitFeedback(request).enqueue(object : Callback<FeedbackResponse> {
            override fun onResponse(call: Call<FeedbackResponse>, response: Response<FeedbackResponse>) {
                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(this@MindTheGapIME, "Feedback logged! Thank you.", Toast.LENGTH_SHORT).show()
                }
                pendingRetrospective = null
                lastAnalyzedMessage = null
                lastAnalysisResponse = null
            }

            override fun onFailure(call: Call<FeedbackResponse>, t: Throwable) {
                Toast.makeText(this@MindTheGapIME, "Failed to log feedback: ${t.message}", Toast.LENGTH_SHORT).show()
                pendingRetrospective = null
                lastAnalyzedMessage = null
                lastAnalysisResponse = null
            }
        })
    }
}
