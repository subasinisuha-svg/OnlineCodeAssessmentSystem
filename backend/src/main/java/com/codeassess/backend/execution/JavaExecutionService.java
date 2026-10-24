package com.codeassess.backend.execution;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.concurrent.TimeUnit;

@Service
public class JavaExecutionService {

    public String execute(String code, String input)
            throws IOException, InterruptedException {

        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Java code cannot be empty.");
        }

        if (code.length() > 20000) {
            throw new IllegalArgumentException("Java code is too large.");
        }

        Path dir = Files.createTempDirectory("codeassess-");

        try {
            Files.writeString(
                dir.resolve("Main.java"),
                code,
                StandardCharsets.UTF_8
            );

            ProcessBuilder pb = new ProcessBuilder(
                "docker", "run", "--rm", "-i",
                "--network", "none",
                "--memory", "128m",
                "--cpus", "0.5",
                "--pids-limit", "32",
                "--tmpfs", "/tmp:rw,nosuid,size=64m",
                "--workdir", "/workspace",
                "-v", dir.toAbsolutePath() + ":/workspace:ro",
                "eclipse-temurin:21-jdk",
                "sh", "-c",
                "mkdir -p /tmp/classes && javac -d /tmp/classes Main.java && java -cp /tmp/classes Main"
            );

            Process process = pb.start();

            try (var stdin = process.getOutputStream()) {
                if (input != null && !input.isEmpty()) {
                    stdin.write(input.getBytes(StandardCharsets.UTF_8));
                }
            }

            boolean completed = process.waitFor(10, TimeUnit.SECONDS);

            if (!completed) {
                process.destroyForcibly();
                process.waitFor();
                throw new IllegalStateException(
                    "Execution timed out after 10 seconds."
                );
            }

            String stdout = new String(
                process.getInputStream().readAllBytes(),
                StandardCharsets.UTF_8
            );

            String stderr = new String(
                process.getErrorStream().readAllBytes(),
                StandardCharsets.UTF_8
            );

            if (process.exitValue() != 0) {
                throw new IllegalStateException(
                    stderr.isBlank() ? "Java execution failed." : stderr
                );
            }

            return stdout;

        } finally {
            try (var paths = Files.walk(dir)) {
                paths.sorted(Comparator.reverseOrder()).forEach(path -> {
                    try {
                        Files.deleteIfExists(path);
                    } catch (IOException ignored) {
                    }
                });
            }
        }
    }
}