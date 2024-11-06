import io
from PIL import Image
import pillow_avif
from django.core.files.base import ContentFile





from v1.image_processing.orientation import correct_image_orientation


def save_image(content, image_field):
    try:
        # Open the original image
        ogimg = Image.open(image_field)
        ogimg = correct_image_orientation(ogimg)
        
        # Create a new image without EXIF data
        clean_img = Image.new(ogimg.mode, ogimg.size)
        clean_img.paste(ogimg)
        
        # Resize the image
        ogwidth, ogheight = clean_img.size
        newsize = (450, int((ogheight / ogwidth) * 450))
        img = clean_img.resize(newsize)
        
        # Save the image as AVIF in a BytesIO buffer
        img_io = io.BytesIO()
        img.save(img_io, format='AVIF', quality=50, reduction=2)  # AVIF-specific options
        img_io.seek(0)
        
        # Prepare the file for saving with .avif extension
        img_content = ContentFile(img_io.getvalue(), name=image_field.name.rsplit('.', 1)[0] + '.avif')
        
        # Delete any existing pic field to avoid cached formats
        if content.pic:
            content.pic.delete(save=False)
        
        # Save the image to the content model with .avif extension
        content.pic.save(img_content.name, img_content, save=False)
        
        # Save the content model instance
        content.save()
        return True, None

    except ValueError:
        return False, 'Invalid image format'
    except Exception as e:
        return False, f'Error processing the image: {str(e)}'