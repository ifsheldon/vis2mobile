import os
import json
import re
#from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI 
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage

class CoderAgent:
    def __init__(self, model_name="gpt-5", temperature=0.0, api_key=None, base_url=None):
        """
        Initialize Google Gemini model
        
        """
        
        google_api_key = api_key or os.getenv("GOOGLE_API_KEY")
        
        if not google_api_key:
            raise ValueError("Error: Google API Key not found. Please set GOOGLE_API_KEY environment variable or pass it during initialization.")

        self.llm = ChatGoogleGenerativeAI(
            model=model_name,
            temperature=temperature,
            google_api_key=api_key,
        )

    def generate_code(self, inputs):
        """
        Core generation logic: Receive structured input -> Assemble Prompt -> Call LLM -> Return code
        """
        # 1. Unpack and process input data
        svg_source = inputs['svg_source']
        action_space = inputs['action_space']
        
        # Process data from plan.json
        problem_context = inputs['problem_context'] 
        action_list = inputs['action_list'] 
        
        # Format JSON data for LLM reading
        data_str = json.dumps(inputs['data'], indent=2) if isinstance(inputs['data'], (dict, list)) else inputs['data']
        action_list_str = json.dumps(action_list, indent=2) if isinstance(action_list, (dict, list)) else action_list
        
        final_shell = inputs['final_shell']

        # 2. System Prompt 
        system_content = f"""
        You are an expert Frontend Engineer and SVG Specialist specialized in Responsive Design.
        Your task is to transform a Desktop SVG visualization into a Mobile-First React Component.

        **YOUR MISSION:**
        Transform a Desktop SVG visualization into a Mobile-First Responsive Component based on a specific execution plan.
        
        **CRITICAL REFERENCE MATERIALS:**
        1. **Allowed Action Space (The "Rulebook"):**
        {action_space}
        *IMPORTANT*: You MUST check "Part 3: Coder Implementation Logic" in the Action Space for every action you execute. Use the defined formulas (math), constants (e.g., opacity values), and DOM strategies strictly.
        The "Action Space" provided describes abstract visualization manipulations (often in low-level SVG terms). 
        You are using **Recharts** (a high-level library). You must TRANSLATE the abstract actions into Recharts props.
        
        *Example Translation:*
        * Abstract Action: `TRANSPOSE_AXES` (Swap X/Y math)
        * Recharts Implementation: Set `<BarChart layout="vertical" ... />` and swap `<XAxis type="number">` / `<YAxis type="category">`.
        
        * Abstract Action: `REMOVE_GRIDLINES`
        * Recharts Implementation: Remove `<CartesianGrid />` or set `horizontal={{false}} vertical={{false}}`.


        2. **Target Mobile Shell (The "Template"):**
        {final_shell}
        **Adopt the Shell:** You must ADOPT this shell structure. Do not write a new component from scratch. Fill in the `[AGENT_ACTION]` placeholders with your implementation. Keep the outer styling and responsive containers defined in the shell.
        **Fill Placeholders:** Look for `// [AGENT_ACTION]: ...` comments in the shell and implement the logic there.
        **Inject Data:** You MUST replace the placeholder `const DATA = [...]` with the actual JSON data provided in the context.


        **Coding Standards:**
        - Use Next.js (App Router), Tailwind CSS, and Lucide React.
        - Use 'recharts' or native SVG for visualization as implied by the shell.
        - Ensure the component is fully responsive.
        - Separate data logic from render logic.
        - The output must be a single, complete, executable .tsx file.

        **4. Quality Assurance & Self-Correction:**
        Before outputting the final code, verify the following:
        1. **Syntax Check:** Ensure all braces `{{}}`, parentheses `()`, and tags are properly closed.
        2. **Import Check:** Verify all used components (from 'recharts', 'lucide-react', etc.) are imported.
        3. **Prop Validation:** Do NOT invent props for Recharts components. Use ONLY standard Recharts API.
        4. **Shell Compliance:** Did you keep the exact outer structure of `final_shell`?
        5. **Logic check:** Does the code correctly implement ALL actions in the `action_list`?
        """

        # 3. Build User Prompt (Specific task context)
        user_content = f"""
        **Task:** Create 'GeneratedChart.tsx' based on the following plan.

        **1. Input Source (Original Desktop View - For Context):**
        ```{inputs.get('source_type', 'html')}
        {svg_source}
        ```

        **2. Data Context (Extracted Data):**
        Use this exact data to render the chart.
        ```json
        {data_str}
        ```

        **3. Planner's Execution Plan:**
        
        **> Global Context (Current Problems):**
        The following issues were identified in the desktop version and must be resolved:
        {problem_context}

        **> Action List (EXECUTE THESE STEPS STRICTLY):**
        For each step below, read the 'reason' to understand the intent, then look up the 'action' in the Action Space for implementation details.
        ```json
        {action_list_str}
        ```

        **Output Requirement:**
        Generate the full `.tsx` file content only. No markdown formatting, no explanations. 
        Ensure you handle the 'reason' behind each action (e.g. if reason mentions "text overlap", ensure your fix actually solves it).
        
        **Final Check:**
        Review your code for any syntax errors or missing imports. Ensure it is a valid, compilable .tsx file.
        """

        # 4. Execute call
        messages = [
            SystemMessage(content=system_content),
            HumanMessage(content=user_content)
        ]
        
        print("🤖 Coder Agent thinking... (Generating code based on plan)")
        response = self.llm.invoke(messages)
        
        return self._clean_output(response.content)

    def _clean_output(self, text):
        """Clean Markdown tags returned by LLM"""
        if isinstance(text, list):
            parts = []
            for item in text:
                if isinstance(item, dict) and 'text' in item:
                    parts.append(item['text'])
                else:
                    parts.append(str(item))
            text = "".join(parts)
            
        #  2. Regex extraction
        pattern = r"```(?:tsx|typescript|javascript|react)?\n(.*?)```"
        match = re.search(pattern, text, re.DOTALL)
        if match:
            return match.group(1).strip()
        
        #  3. Manual cleaning
        if "```" in text:
            parts = text.split("```")
            if len(parts) >= 3:
                return parts[1].strip()
                
        return text.strip()

# ==========================================
# Utility function: File loading
# ==========================================
def load_file_content(filepath):
    """Read file content, automatically handle JSON"""
    if not os.path.exists(filepath):
        print(f"⚠️ Warning: File not found: {filepath}")
        return ""
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        if filepath.endswith(".json"):
            return json.loads(content)
        return content

# ==========================================
# Main Execution Flow (Interface with Mock Data)
# ==========================================
if __name__ == "__main__":
    # 1. Define file paths (Assumes files are in current directory) -- to be modified as needed
    files = {
        "svg": "kennedy-desktop.html",
        "action_space": "action_space.md",
        "data": "data.json",
        "shell": "MobileChartShell.tsx",
        "plan": "plan.json"
    }

    # 2. Read all Data
    print("Loading mock data from files...")
    
    svg_source = load_file_content(files["svg"])
    action_space = load_file_content(files["action_space"])
    data = load_file_content(files["data"])
    final_shell = load_file_content(files["shell"])
    plan_json = load_file_content(files["plan"])

    # 3. Parse Reason and Action List from Plan.json
    # logic: 'current_problems' is the high-level rationale ("Reasoning" context)
    #        'action_list' contains specific steps with their own specific reasons.
    if isinstance(plan_json, dict):
        problem_context = "\n".join(plan_json.get("current_problems", []))
        action_list = plan_json.get("action_list", [])
    else:
        problem_context = "Refactor SVG for mobile."
        action_list = str(plan_json)

    # 4. Assemble Input Interface
    # Detect file type for prompt
    source_ext = "svg" if files["svg"].endswith(".svg") else "html"
    
    inputs = {
        'svg_source': svg_source,
        'source_type': source_ext,
        'action_space': action_space,
        'problem_context': problem_context, # Renamed from 'reason' to avoid confusion
        'data': data,
        'final_shell': final_shell,
        'action_list': action_list
    }

    my_key = "YOUR_GOOGLE_API_KEY_HERE"  # Replace with your actual API key

    # 5. Start Agent
    agent = CoderAgent(
    model_name="gemini-3-pro-preview",
    api_key= my_key
)
    generated_code = agent.generate_code(inputs)
    
    # 6. Save result
    output_filename = "GeneratedMobileChart.tsx"
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write(generated_code)
    
    print(f"Success! Code generated and saved to: {output_filename}")