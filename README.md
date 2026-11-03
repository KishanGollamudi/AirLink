Cloud TPU v5e LLM Serving & Inference Pipeline

An end-to-end AI infrastructure and serving pipeline executing autoregressive large language model (LLM) inference on Google Cloud TPU v5e-1 hardware via native PyTorch-XLA (torch.device("tpu")), with XLA graph optimization and a live Gradio web interface.

🏗️ Architecture Overview

[ Client / Web Browser ]
         │
         ▼  (HTTPS / Gradio Tunnel)
[ Gradio UI Layer / FastAPI Service ]
         │
         ▼  (Left-Padded Static Batched Tensors)
[ PyTorch-XLA Execution Layer (torch.device("tpu")) ]
         │
         ▼  (Compiled XLA HLO Computation Graph)
[ Google Cloud TPU v5e Systolic Array Matrix Engine (bfloat16) ]


⚡ System Specifications & Target Hardware

Specification

Configuration

Accelerator

Google Cloud TPU v5e (Single-core slice v5e-1)

Precision

bfloat16 (Native Systolic Array Tensor Core support)

Model

Qwen/Qwen2.5-Coder-1.5B-Instruct

PyTorch Backend

Native TorchTPU (PrivateUse1 backend mapped to tpu:0)

Token Padding

Left-padding (tokenizer.padding_side = 'left')

📊 Benchmark & Latency Analysis

1. Cold Start vs. Warm Graph Compilation

Cloud TPUs rely on Ahead-Of-Time (AOT) / Just-In-Time (JIT) graph compilation via OpenXLA. When the model is first fed an unseen tensor shape, the XLA compiler generates an optimized hardware kernel before executing:

Cold Start Latency (First Forward Pass): 26.84s (Includes weight allocation to HBM + XLA graph compilation)

Warm Single-Prompt Latency: 6.38s (Graph cached in TPU memory)

Single Stream Throughput: 6.4 tokens/sec

2. Batched Inference & GEMM Throughput Optimization

Because systolic arrays are optimized for dense matrix multiplications (GEMM) rather than serial single-token steps, batching requests with fixed left-padding dramatically increases aggregate throughput without linear latency penalties:

Batch Size: 4 concurrent prompts

Batch Execution Time: 6.30s

Aggregate Throughput: 38.1 tokens/sec (~6x throughput multiplier over single-stream)

🛠️ Key Technical Challenges & Solutions

Issue 1: torch_xla Import Failure on Modern Colab Runtimes

Symptom: ModuleNotFoundError: No module named 'torch_xla'.

Root Cause: Modern Colab TPU v5e environments register PyTorch's native hardware device backend (torch.device("tpu")) directly instead of relying on legacy external wrappers.

Solution: Directly targeted the registered hardware backend:

import torch
device = torch.device("tpu")


Issue 2: Autoregressive Decoder Output Corruption

Symptom: Hallucinated tokens and garbled text (e.g., In,**wen. a a large Cloud...).

Root Cause: By default, Hugging Face tokenizers apply right-padding. For causal autoregressive decoder-only architectures, right-padding alters the attention mask calculation at the generation boundary.

Solution: Enforced left-padding orientation:

tokenizer.padding_side = "left"
tokenizer.pad_token = tokenizer.eos_token


Issue 3: Dynamic Shape Recompilation Storms

Symptom: Sudden 40+ second pauses when running different prompts.

Root Cause: Passing variable sequence lengths causes the XLA engine to trigger full kernel recompilations for every unseen tensor dimension.

Solution: Fixed batch shapes and tensor alignment using explicit sequence truncation and static padding bounds.

🚀 Step-by-Step Implementation

Step 1: Initialize TPU Hardware

import torch

device = torch.device("tpu")
print(f"Hardware Status: CONNECTED on {device}")

# Verify tensor multiplication directly on the TPU systolic array
x = torch.randn((4, 4), device=device)
y = torch.ones((4, 4), device=device)
z = torch.matmul(x, y)
print("Execution test:", z)


Step 2: Install Serving Dependencies

pip install -q transformers accelerate sentencepiece gradio


Step 3: Load Weights & Configure Tokenizer

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

device = torch.device("tpu")
model_id = "Qwen/Qwen2.5-Coder-1.5B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(model_id)
tokenizer.padding_side = "left"
tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16
).to(device)


Step 4: Launch Interactive Web UI

import gradio as gr

def chat_tpu(message, history, max_new_tokens, temperature):
    conversation = []
    for turn in history:
        if isinstance(turn, dict):
            conversation.append({"role": turn.get("role", "user"), "content": turn.get("content", "")})
        elif isinstance(turn, (list, tuple)) and len(turn) == 2:
            if turn[0]: conversation.append({"role": "user", "content": turn[0]})
            if turn[1]: conversation.append({"role": "assistant", "content": turn[1]})
    conversation.append({"role": "user", "content": message})
    
    formatted_prompt = tokenizer.apply_chat_template(conversation, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(formatted_prompt, return_tensors="pt").to(device)
    
    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=int(max_new_tokens),
            do_sample=(temperature > 0.0),
            temperature=float(temperature) if temperature > 0.0 else None,
            pad_token_id=tokenizer.eos_token_id
        )
    
    new_tokens = output[0][inputs.input_ids.shape[1]:]
    return tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

demo = gr.ChatInterface(
    fn=chat_tpu,
    title="Cloud TPU v5e-1 Inference Dashboard",
    additional_inputs=[
        gr.Slider(minimum=32, maximum=512, value=256, step=16, label="Max Tokens"),
        gr.Slider(minimum=0.0, maximum=1.0, value=0.0, step=0.1, label="Temperature")
    ]
)

demo.launch(share=True)


📌 Repository Structure

├── tpu_llm_serving_pipeline.ipynb   # Main Google Colab notebook running on TPU v5e
├── README.md                        # Architecture, benchmarks, and project documentation
└── requirements.txt                 # Python dependencies
