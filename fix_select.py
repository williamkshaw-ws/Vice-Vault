import re

with open("src/components/AddMissingBallForm.tsx", "r") as f:
    text = f.read()

# Make the Year select identical to the input visually
old_select = """               <select
                 value={year}
                 onChange={(e) => setYear(e.target.value)}
                 className="w-full bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 focus:border-[#2563eb]/50 rounded-lg py-2 px-3 text-xs text-white placeholder-neutral-600 outline-none transition-all cursor-pointer"
               >"""

new_select = """               <select
                 value={year}
                 onChange={(e) => setYear(e.target.value)}
                 className="w-full h-[34px] bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 focus:border-[#2563eb]/50 rounded-lg py-1 px-3 text-xs text-white placeholder-neutral-600 outline-none transition-all cursor-pointer appearance-none"
                 style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2371717a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
               >"""

text = text.replace(old_select, new_select)

with open("src/components/AddMissingBallForm.tsx", "w") as f:
    f.write(text)

