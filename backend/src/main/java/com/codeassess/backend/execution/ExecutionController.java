package com.codeassess.backend.execution;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ExecutionController {

    private final JavaExecutionService javaExecutionService;

    public ExecutionController(JavaExecutionService javaExecutionService) {
        this.javaExecutionService = javaExecutionService;
    }

    @PostMapping("/execute")
    public Map<String, String> execute(
            @RequestBody Map<String, String> request) {

        try {
            String code = request.getOrDefault("code", "");
            String input = request.getOrDefault("input", "");

            String output = javaExecutionService.execute(code, input);

            return Map.of("output", output);

        } catch (Exception e) {
            return Map.of(
                "error",
                e.getMessage() == null
                    ? "Code execution failed."
                    : e.getMessage()
            );
        }
    }
    @PostMapping("/submit")
public Map<String, Object> submit(@RequestBody Map<String, Object> request) {
    try {
        String code = String.valueOf(request.getOrDefault("code", ""));
        Object questionIdValue = request.get("questionId");
        String questionId = questionIdValue == null
                ? "1"
                : questionIdValue.toString();

        String input = "";
        String expectedOutput = "";

        if ("1".equals(questionId)) {
            input = "10 20";
            expectedOutput = "30";
        } else if ("2".equals(questionId)) {
            input = "5 7";
            expectedOutput = "12";
        } else if ("3".equals(questionId)) {
            input = "1 2";
            expectedOutput = "3";
        } else {
            input="10 20";
            expectedOutput="30";
        }

        String actualOutput = javaExecutionService
                .execute(code, input).trim();

        boolean passed = expectedOutput.equals(actualOutput);

        return Map.of(
                "questionId", questionId,
                "total", 1,
                "passed", passed ? 1 : 0,
                "actual", actualOutput,
                "expected", expectedOutput,
                "percentage", passed ? 100 : 0
        );
    } catch (Exception e) {
        return Map.of(
                "error",
                e.getMessage() == null
                        ? "Submission failed."
                        : e.getMessage()
        );
    }
}
}