from PIL import Image
from .orientation import correct_image_orientation

def image_resize(image_field):
    ogimg=Image.open(image_field)
    ogimg=correct_image_orientation(ogimg)

    clean_img = Image.new(ogimg.mode, ogimg.size)
    clean_img.paste(ogimg)

    ogwidth, ogheight = clean_img.size
    newsize = (450, int((ogheight / ogwidth) * 450))
    img = clean_img.resize(newsize)

    return img