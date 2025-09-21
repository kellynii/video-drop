app.post('/submit', async (req, res) => {
  try {
    // Grab the first non-empty field from the body
    const payload = req.body;

    // Look for a value inside the body (no matter the key)
    const value = Object.values(payload).find(v => typeof v === "string" && v.trim() !== "");

    if (!value) {
      return res.status(400).json({ error: "No valid value provided" });
    }

    // Insert into your Supabase (or log it for now)
    console.log("Received:", value);

    // Example: if you're using Supabase
    // await supabase.from("submissions").insert([{ link: value }]);

    res.json({ success: true, saved: value });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});
