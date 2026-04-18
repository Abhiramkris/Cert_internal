const fs = require('fs');
const path = require('path');

const checks = [
  {
    name: "Clean Docker Exposure (No Preview Ports)",
    file: "docker-compose.yml",
    pattern: /^((?!3001-3010:3001-3010).)*$/s,
    expected: "No 3001-3010 mapping"
  },
  {
    name: "Nginx Route Pooling (/preview/)",
    file: "nginx.conf",
    pattern: /location ~ \^\\\/preview\\\//,
    expected: "location ~ ^/preview/"
  },
  {
    name: "Nginx Host Preservation ($http_host)",
    file: "nginx.conf",
    pattern: /proxy_set_header Host \$http_host;/,
    expected: "Host $http_host"
  },
  {
    name: "Application Logic (Project Preview Range)",
    file: "src/app/dashboard/projects/builder-actions.ts",
    pattern: /getAvailablePort\(3001, 3010\)/,
    expected: "getAvailablePort(3001, 3010) [Call Site 1]"
  },
  {
    name: "Application Logic (Library Audit Range)",
    file: "src/app/dashboard/projects/builder-actions.ts",
    pattern: /getAvailablePort\(3001, 3010\)/g,
    expected: "Multiple occurrences of getAvailablePort(3001, 3010)",
    custom: (content) => (content.match(/getAvailablePort\(3001, 3010\)/g) || []).length >= 2
  },
  {
    name: "Project Generator (allowedDevOrigins Range)",
    file: "src/utils/builder/project-assembly.ts",
    pattern: /3001 \+ i/,
    expected: "Loop to generate dynamic ports (3001+i)"
  },
  {
    name: "Project Generator (Secure Context Shim)",
    file: "src/utils/builder/project-assembly.ts",
    pattern: /window\.crypto\.subtle/,
    expected: "Hydration Shim for Remote Origins"
  }
];

console.log("\n--- Studio Architect v3.0 Infrastructure Diagnostic ---\n");

let passedAll = true;

checks.forEach(check => {
  try {
    const fullPath = path.join(process.cwd(), check.file);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    let passed = false;
    if (check.custom) {
      passed = check.custom(content);
    } else {
      passed = check.pattern.test(content);
    }

    if (passed) {
      console.log(`[PASS] ${check.name}`);
    } else {
      passedAll = false;
      console.log(`[FAIL] ${check.name}`);
      console.log(`       Target was not found in ${check.file}`);
      console.log(`       Checking for: ${check.expected} `);
    }
  } catch (err) {
    passedAll = false;
    console.log(`[FAIL] ${check.name}`);
    console.log(`       Error reading file ${check.file}: ${err.message}`);
  }
});

console.log("\n------------------------------------------------------");
if (passedAll) {
  console.log("FINAL STATUS: INTEGRITY VERIFIED - SYSTEM READY");
} else {
  console.log("FINAL STATUS: SOME CHECKS FAILED - MANUAL REVIEW NEEDED");
}
console.log("------------------------------------------------------\n");
