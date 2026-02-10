
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://127.0.0.1:27017/shop";

async function fixHomepage() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        // 1. Ensure at least 3 products are in the slider
        const sliderCount = await Product.countDocuments({ showInSlider: true });
        if (sliderCount < 3) {
            console.log(`Only ${sliderCount} slider products found. Updating...`);
            const productsToUpdate = await Product.find({ isActive: true }).limit(3);
            for (const p of productsToUpdate) {
                await Product.findByIdAndUpdate(p._id, {
                    showInSlider: true,
                    isBuyNowEnabled: false
                });
                console.log(`Updated ${p.name} to show in slider.`);
            }
        } else {
            console.log("Slider products already configured.");
        }

        // 2. Ensure some products are active for the grid
        const activeCount = await Product.countDocuments({ isActive: true });
        console.log(`Total active products: ${activeCount}`);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

fixHomepage();
